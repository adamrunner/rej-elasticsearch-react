function loadFilters ( ){
  client.search({
    "index": "development-categories-products",
    "size": 0,
    "body":{"aggs":{"class":{"terms":{"field":"product_class"}},"product_type":{"terms":{"field":"product_type"}}}}
  }).then(function ( body ){
    window.body_results = body
  })
}

{ this.props.buckets.map((bucket) => {
  <div class="bucket">
    {bucket.key}: { bucket.doc_count}
  </div>
})}

loadFilters ( ){
  client.search({
    "index": "development-categories-products",
    "size": 0,
    "body":{"aggs":{"class":{"terms":{"field":"product_class"}},"supercat":{"terms":{"field":"supercat"}},"category":{"terms":{"field":"category"}},"product_type":{"terms":{"field":"product_type"}}}}
  }).then(function ( body ){
    window.aggregations = body.aggregations
    return body.aggregations
    this.setState({
      aggregations: body.aggregations
    })
  }.bind(this), function ( error ) {
    console.trace( error.message );
  })
},
