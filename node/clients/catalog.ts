import type { InstanceOptions, IOContext } from '@vtex/api'
import { JanusClient } from '@vtex/api'

export class Catalog extends JanusClient {
  constructor(ctx: IOContext, options?: InstanceOptions) {
    super(ctx, {
      ...options,
    })
  }

  public getCategoryTree = async (): Promise<CategoryTree[]> =>
    this.http.get('/api/catalog_system/pub/category/tree/100', {
      metric: 'catalog-get-category-tree',
    })

  public getProductBySKU = async (skuId: string): Promise<any> => {
    try {
      // First, get SKU details to know the productId
      const skuData = await this.http.get(`/api/catalog/pvt/stockkeepingunit/${skuId}`, {
        metric: 'catalog-get-sku',
        headers: {
          VtexIdClientAutCookie: this.context.authToken,
        },
      })

      if (!skuData) {
        return null
      }

      const productId = skuData.ProductId

      // Use the public endpoint that returns complete product info with SKUs and sellers
      const productVariations = await this.http.get(
        `/api/catalog_system/pub/products/variations/${productId}`,
        {
          metric: 'catalog-get-product-variations',
        }
      )

      if (!productVariations) {
        return null
      }

      // Find the specific SKU in the variations
      const targetSku = productVariations.skus?.find((sku: any) => sku.sku === parseInt(skuId, 10))

      if (!targetSku) {
        return null
      }

      // Transform sellers
      const sellers = [{
        sellerId: targetSku.sellerId || '1',
        sellerName: targetSku.seller || 'Default Seller',
        commertialOffer: {
          Price: targetSku.bestPrice || targetSku.Price || 0,
          ListPrice: targetSku.listPrice || targetSku.ListPrice || 0,
        },
      }]

      // Get images
      const images = targetSku.image ? [{ imageUrl: targetSku.image }] : []

      // Transform to match expected structure
      return {
        productId: productVariations.productId?.toString() || productId.toString(),
        productName: productVariations.name,
        productReference: productVariations.productId?.toString() || productId.toString(),
        items: [
          {
            itemId: skuId,
            name: targetSku.skuname,
            nameComplete: targetSku.skuname,
            images,
            sellers,
          },
        ],
      }
    } catch (error) {
      throw error
    }
  }
}
