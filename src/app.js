import React from 'react'
import { render } from 'react-dom'
import elasticsearch from 'elasticsearch'

let client = new elasticsearch.Client({
	host: ['https://251a506566f18dc3000.qbox.io','https://251a506566f18dc3001.qbox.io','https://251a506566f18dc3002.qbox.io'],
	log: 'trace'
})
let loadFilters = function(){
	return client.search({
		"index": "development-categories-products",
		"size": 0,
		"body":{"aggs":{
			"class":{"terms":{"field":"product_class"}},
			"supercat":{"terms":{"field":"supercat"}},
			"category":{"terms":{"field":"category"}},
			"product_type":{"terms":{"field":"product_type"}},
			"always_free_to_ship":{"terms":{"field":"always_free_to_ship"}}
		}}
	})
}
let search = function(matchQuery){
	const per_page = document.getElementById('per_page').value
	return client.search({
		"index": "development-categories-products",
		"size": per_page,
		"body":{"query":{"match": matchQuery},
		"aggs":{
			"class":{"terms":{"field":"product_class"}},
			"supercat":{"terms":{"field":"supercat"}},
			"category":{"terms":{"field":"category"}},
			"product_type":{"terms":{"field":"product_type"}},
			"always_free_to_ship":{"terms":{"field":"always_free_to_ship"}}
		}}
	})
}
const App = React.createClass({
	getInitialState () {
		return {
			results: [],
			totalResults: 0,
			aggregations: {}
		}
	},
	componentDidMount () {
		var aggregations = loadFilters().then((body) => {
			window.aggregations = body.aggregations
			this.setState({
				aggregations: body.aggregations
			})
		})
	},
	updateFiltering(event){
		var matchQuery = {}
		matchQuery[event.currentTarget.dataset.title] = event.currentTarget.dataset.key
		search(matchQuery).then((body) => {
			this.setState({
				results: body.hits.hits,
				totalResults: body.hits.total,
				aggregations: body.aggregations
			})
		})
	},
	handleChange ( event ) {
		event.preventDefault();
		const search_query  = document.getElementById('search').value
		const per_page = document.getElementById('per_page').value
		client.search({
			index: 'development-categories-products',
			q: search_query,
			size: per_page
		}).then(function ( body ) {
			this.setState({
				results: body.hits.hits,
				totalResults: body.hits.total
			})
		}.bind(this), function ( error ) {
			console.trace( error.message );
		});
	},
	render () {
		return (
			<div className="container">
				<button type="button" onClick={ this.loadFilters }>Load Filters</button>
				<FilterControls aggregations={ this.state.aggregations } updateFiltering= { this.updateFiltering }/>
				<form onChange={ this.handleChange } onSubmit= { this.handleChange }>

					<label htmlFor="search">Search: </label>
					<input type="text" id="search" autoComplete="off" placeholder="Search"/>&nbsp;

					<label htmlFor="per_page">Per Page: </label>
					<select id="per_page" defaultValue="10">
					  <option value="10">10</option>
					  <option value="20">20</option>
					  <option value="30">30</option>
					</select>
				</form>
				<TotalResults totalResults={ this.state.totalResults } />
				<SearchResults results={ this.state.results } />
			</div>
		)
	}
})
const FilterControls = React.createClass({
	propTypes: {
		aggregations: React.PropTypes.object,
		updateFiltering: React.PropTypes.func
	},
	getDefaultProps () {
		return { aggregations: {} }
	},
	render() {
		return (
			<div className="filterControls">
				{ Object.keys(this.props.aggregations).map((aggregation_title, index) =>  {
					return (
						<AggregationControl key={ index } aggregation= { this.props.aggregations[aggregation_title] } title={ aggregation_title } updateFiltering= { this.props.updateFiltering }/>
					)
				})}
			</div>
		)
	}
})
const AggregationControl = React.createClass({
	propTypes: {
		title: React.PropTypes.string,
		aggregation: React.PropTypes.object,
		updateFiltering: React.PropTypes.func
	},
	getDefaultProps () {
		return {
			title: "",
			aggregation: {}
		}
	},
	render () {
		return (
			<div className="agg_control">
				<span>{ this.props.title }</span>
				<ul>
				{ this.props.aggregation.buckets.map((bucket, index) => {
					return (
						<li key={ index }>
							<a href="#" onClick={ this.props.updateFiltering } data-title= { this.props.title } data-key= { bucket.key }>{ bucket.key }: { bucket.doc_count }</a>
						</li>
					)
				})}
				</ul>
			</div>
		)
	}
})
const TotalResults = React.createClass({
	propTypes: {
		totalResults: React.PropTypes.number
	},
	getDefaultProps () {
		return { totalResults: 0 }
	},
	render () {
		return (
			<div className="totalResults"> Total Results: { this.props.totalResults }</div>
		)
	}
})
const SearchResults = React.createClass({
	propTypes: {
		results: React.PropTypes.array
	},
	getDefaultProps () {
		return { results: [] }
	},
	render () {
		return (
			<div className="search_results">
				<hr />
				<ul>
				{ this.props.results.map((result, index) => {
					return <SearchResult key={ result._id } data={ result._source } index={ index } />
				})}
				</ul>
			</div>
		)
	}
})
const SearchResult = React.createClass({
	propTypes: {
		data: React.PropTypes.object,
		index: React.PropTypes.number
	},
	getDefaultProps () {
		return {
			data: {},
			index: 0
		}
	},
	render () {
		return (
			<li><a href={ this.props.data.path }>{ this.props.data.name }</a>
				<ul>
					<li>Category: { this.props.data.category }</li>
					<li>Supercat: { this.props.data.supercat }</li>
					<li>Product Class: { this.props.data.product_class }</li>
					<li>DAX Item ID: { this.props.data.dax_item_id }</li>
					<li>Product Type: { this.props.data.product_type }</li>
					<li>${ this.props.data.price }</li>
				</ul>
				<img src={ this.props.data.grid_image } width="220" height="220" />
			</li>
		)
	}
})

render( <App />, document.getElementById( 'main' ) )
