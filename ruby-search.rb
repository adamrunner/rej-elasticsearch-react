#NOTE: Gathers aggregations on those fields
c.search(
index: "development-categories-products",
size: 0,
body: {
  aggs: {
    class: {
      terms: {
        field: 'product_class.raw'
      }
    },
    product_type: {
      terms: {
        field: 'product_type'
      }
    },
    category: {
      terms: {
        field: 'category'
      }
    },
    supercat: {
      terms: {
        field: 'supercat'
      }
    }
  }
})

#NOTE: Queries the index based on the would be value of one of those aggregations

c.search(
index: "development-categories-products",
body:{
  query: { match: {supercat: "Lighting" }}
})
c.search(
index: "development-categories-products",
size: 20,
body:{
  query: { match: { product_type: 'Pendants' } } }
)
