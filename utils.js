module.exports={
	rename_property: function(obj,old_key,new_key)
	{
		if (old_key !== new_key) {
			Object.defineProperty(obj, new_key,
				Object.getOwnPropertyDescriptor(obj, old_key));
			delete obj[old_key];
		}
	},
	
	//rename all property to coherent key between tv,movie and person
	proper_property : function(obj,type)
	{
		//console.log(obj)
		res = {}
		//type
		res.type=type
		res.id = obj.id 

		
		
		
		switch (type)
		{
			case "band":
			res.name=obj.name
			if (obj["life-span"] )
			{
				res.birthday=obj["life-span"]["begin"]

				res.deathday=obj["life-span"]["end"]

			}


			res.releases=[]
			for ( var r in obj["releases"])
			{
				res.releases.push({
					name : obj["releases"][r].title,
					id : obj["releases"][r].id,
					date : obj["releases"][r].date,
					info:  obj["releases"][r].country,
					type: "album"})
			}
			
			break
			case "album" :
			res.name=obj.title
			if (obj.date)
			{
				res.date=obj.date
			}
			if (obj.country)
			{
				res.countries=[{id:obj.country,
					name:obj.country,
					type:"nation"}]
				}

				res.artist={
					name :obj['artist-credit'][0].artist.name,
					id : obj['artist-credit'][0].artist.id,
					type : "band"}
					res.info=obj['artist-credit'][0].artist.name

					res.songs=[]
					for ( var r in obj.media[0].tracks)
					{
						res.songs.push({
							name : obj.media[0].tracks[r].recording.title,
							id : obj.media[0].tracks[r].recording.id,
							type: "song"})
					}			

					break

					case "song" :
					res.name=obj.title
					if (obj.length)
					{
						res.runtime=ms_to_minsec(obj.length)
					}
					res.artist={
						name :obj['artist-credit'][0].artist.name,
						id : obj['artist-credit'][0].artist.id,
						type : "band"}
						res.info=obj['artist-credit'][0].artist.name
						res.releases=[]
						if (obj["releases"])
						{
							for ( var r in obj["releases"])
							{
								res.releases.push({
									name : obj["releases"][r].title,
									id : obj["releases"][r].id,
									date :  obj["releases"][r].date,
									info:  obj["releases"][r].country,
									type: "album"})
							}
						}
						break
						case "movie":
						res.tmdb_id=obj.id
						res.name=obj.title
						if (obj.title !=obj.original_title)
						{
							res.original_name=obj.original_title
						}
						res.date = obj.release_date
						res.year = new Date(res.date).getFullYear()
						res.genres=[]
						for (var i in obj.genres)
						{
							res.genres[res.genres.length]=
							{
								name:obj.genres[i].name,
								type:"genre",
								id:obj.genres[i].id
							}

						}

				//res.backdrop=obj.backdrop_path
				res.poster=obj.poster_path
				
				res.imdb= obj.imdb_id

				res.site=obj.homepage
				res.overview=obj.overview
				res.tagline=obj.tagline
				res.runtime=obj.runtime
				res.languages=[{id:obj.original_language,name:obj.original_language,type:"language"}]
				for (var i in obj.spoken_languages)
				{
					if (obj.spoken_languages[i].iso_639_1!=obj.original_language)
					{
						res.languages[res.languages.length]=
						{
							id:obj.spoken_languages[i].iso_639_1,
							name:obj.spoken_languages[i].name,
							type:"language"
						}
					}
				}
				res.status=obj.status
				res.companies=obj.production_companies
				res.countries=obj.production_countries
				
				if (obj.vote_count>=5)
				{
					res.rating=obj.vote_average
				}
				if ( obj.keywords)
				{
					res.keywords=[]

					for (var i in obj.keywords.keywords)
					{
						res.keywords[res.keywords.length]=
						{
							id:obj.keywords.keywords[i].id,
							name:obj.keywords.keywords[i].name,
							type:"keyword"
						}
					}
				}
				if (obj.images)
				{
					res.backdrops=[]
					res.posters=[]
					for ( var i in obj.images.backdrops)
					{
						res.backdrops[res.backdrops.length]=obj.images.backdrops[i].file_path
					}
					for ( var i in obj.images.posters)
					{
						res.posters[res.posters.length]=obj.images.posters[i].file_path
					}
				}
				if (obj.credits)
				{
					res.cast=[]
					for (var i in obj.credits.cast)
					{
						res.cast[res.cast.length]=
						{
							name:obj.credits.cast[i].name,
							id:obj.credits.cast[i].id,
							type:"person",
							poster:obj.credits.cast[i].profile_path,
							info:obj.credits.cast[i].character
						}
					}
					res.crew=[]
					for (var i in obj.credits.crew)
					{
						res.crew[res.crew.length]=
						{
							name:obj.credits.crew[i].name,
							id:obj.credits.crew[i].id,
							type:"person",
							poster:obj.credits.crew[i].profile_path,
							info:obj.credits.crew[i].job
						}
					}
					res.director=[]
					for (var i in obj.credits.crew)
					{
						if (obj.credits.crew[i].job=="Director")
						{
							res.director[res.director.length]=
							{
								name:obj.credits.crew[i].name,
								id:obj.credits.crew[i].id,
								type:"person",
								poster:obj.credits.crew[i].profile_path
							}
						}
					}					
				}
				res.productions=[]
				for (var i in  obj.production_companies)
				{
					res.productions[res.productions.length]=
					{
						id:obj.production_companies[i].id,
						name:obj.production_companies[i].name,
						type:"compagny"
					}
				}
				res.countries=[]
				for (var i in  obj.production_countries)
				{
					res.countries[res.countries.length]=
					{
						id:obj.production_countries[i].iso_3166_1,
						name:obj.production_countries[i].name,
						type:"nation"
					}
				}
				break
				case "tv":
				res.tmdb_id=obj.id
				res.name=obj.name
				if (obj.name !=obj.original_name)
				{
					res.original_name=obj.original_name
				}
				res.runtime=obj.episode_run_time
				res.date=obj.first_air_date
				res.year = new Date(res.date).getFullYear()+"-"+(obj.in_production?"...":new Date(obj.last_air_date).getFullYear())
				res.status=obj.status
				if (obj.external_ids)
				{
					res.imdb=obj.external_ids.imdb_id
				}
				res.genres=[]
				for (var i in obj.genres)
				{
					res.genres[res.genres.length]={name:obj.genres[i].name,type:"genre",id:obj.genres[i].id}
					
				}
				res.site=obj.homepage
				res.last_air_date=obj.last_air_date
				res.overview=obj.overview
				if (obj.vote_count>=5)
				{
					res.rating=obj.vote_average
				}
				res.seasons=obj.number_of_seasons
				res.episodes=obj.number_of_episodes
				res.poster=obj.poster_path
				res.networks=[]
				for (var i in  obj.networks)
				{
					res.networks[res.networks.length]=
					{
						id:obj.networks[i].id,
						name:obj.networks[i].name,
						type:"network"
					}
				}
				res.productions=[]
				for (var i in  obj.production_companies)
				{
					res.productions[res.productions.length]=
					{
						id:obj.production_companies[i].id,
						name:obj.production_companies[i].name,
						type:"production"
					}
				}
				res.languages=[{id:obj.original_language,name:obj.original_language,type:"language"}]
				for (var i in obj.languages)
				{
					if (obj.languages!=obj.original_language)
					{
						res.languages[res.languages.length]=
						{
							id:obj.languages[i],
							name:obj.languages[i],
							type:"language"
						}
					}
				}

				if (obj.images)
				{
					res.backdrops=[]
					res.posters=[]
					for ( var i in obj.images.backdrops)
					{
						res.backdrops[res.backdrops.length]=obj.images.backdrops[i].file_path
					}
					for ( var i in obj.images.posters)
					{
						res.posters[res.posters.length]=obj.images.posters[i].file_path
					}
				}
				if (obj.credits)
				{
					res.tv_cast=[]
					for (var i in obj.credits.cast)
					{
						res.tv_cast[res.tv_cast.length]=
						{
							name:obj.credits.cast[i].name,
							id:obj.credits.cast[i].id,
							type:"person",
							poster:obj.credits.cast[i].profile_path,
							info:obj.credits.cast[i].character
						}
					}
					res.tv_crew=[]
					for (var i in obj.credits.crew)
					{
						res.tv_crew[res.tv_crew.length]=
						{
							name:obj.credits.crew[i].name,
							id:obj.credits.crew[i].id,
							type:"person",
							poster:obj.credits.crew[i].profile_path,
							info:obj.credits.crew[i].job
						}
					}
					res.tv_creator=[]
					for (var i in obj.credits.crew)
					{
						if (obj.credits.crew[i].job=="Creator")
						{
							res.tv_creator[res.tv_creator.length]=
							{
								name:obj.credits.crew[i].name,
								id:obj.credits.crew[i].id,
								type:"person",
								poster:obj.credits.crew[i].profile_path
							}
						}
					}					
				}	

				break
				case "person":
				res.tmdb_id=obj.id
				res.name=obj.name
				res.birthday=obj.birthday
				res.deathday=obj.deathday
				res.birthplace=obj.place_of_birth
				res.overview=obj.biography
				if (obj.external_ids)
				{
					res.imdb=obj.external_ids.imdb_id
				}
				res.poster=obj.profile_path
				res.site=obj.homepage
				if (obj.images)
				{
					res.backdrops=[]
					res.posters=[]
					for ( var i in obj.images.backdrops)
					{
						res.backdrops[res.backdrops.length]=obj.images.backdrops[i].file_path
					}
					for ( var i in obj.images.profiles)
					{
						res.posters[res.posters.length]=obj.images.profiles[i].file_path
					}
				}
				if (obj.movie_credits)
				{
					obj.movie_credits.cast.sort(compare_date)
					res.cast=[]
					for (var i in obj.movie_credits.cast)
					{
						res.cast[res.cast.length]=
						{
							name:obj.movie_credits.cast[i].title+" ("+new Date(obj.movie_credits.cast[i].release_date).getFullYear()+")",
							id:obj.movie_credits.cast[i].id,
							type:"movie",
							poster:obj.movie_credits.cast[i].poster_path,
							info:obj.movie_credits.cast[i].character
						}
					}
					obj.movie_credits.crew.sort(compare_date)
					res.crew=[]
					for (var i in obj.movie_credits.crew)
					{
						res.crew[res.crew.length]=
						{
							name:obj.movie_credits.crew[i].title+" ("+new Date(obj.movie_credits.crew[i].release_date).getFullYear()+")",
							id:obj.movie_credits.crew[i].id,
							type:"movie",
							poster:obj.movie_credits.crew[i].poster_path,
							info:obj.movie_credits.crew[i].job
						}
					}
					res.director=[]
					
					for (var i in obj.movie_credits.crew)
					{
						if (obj.movie_credits.crew[i].job=="Director")
						{
							res.director[res.director.length]=
							{
								name:obj.movie_credits.crew[i].title+" ("+new Date(obj.movie_credits.crew[i].release_date).getFullYear()+")",
								id:obj.movie_credits.crew[i].id,
								type:"movie",
								poster:obj.movie_credits.crew[i].poster_path
							}
						}
					}
				}
				if (obj.tv_credits)
				{
					obj.tv_credits.cast.sort(compare_date)
					res.tv_cast=[]
					for (var i in obj.tv_credits.cast)
					{
						res.tv_cast[res.tv_cast.length]=
						{
							name:obj.tv_credits.cast[i].name+" ("+new Date(obj.tv_credits.cast[i].first_air_date).getFullYear()+")",
							id:obj.tv_credits.cast[i].id,
							type:"tv",
							poster:obj.tv_credits.cast[i].poster_path,
							info:obj.tv_credits.cast[i].character+" ("+obj.tv_credits.cast[i].episode_count+")"
						}
					}
					obj.tv_credits.crew.sort(compare_date)
					res.tv_crew=[]
					for (var i in obj.tv_credits.crew)
					{
						res.tv_crew[res.tv_crew.length]=
						{
							name:obj.tv_credits.crew[i].name+" ("+new Date(obj.tv_credits.crew[i].first_air_date).getFullYear()+")",
							id:obj.tv_credits.crew[i].id,
							type:"tv",
							poster:obj.tv_credits.crew[i].poster_path,
							info:obj.tv_credits.crew[i].job
						}
					}
					res.tv_creator=[]
					
					for (var i in obj.tv_credits.crew)
					{
						if (obj.tv_credits.crew[i].job=="Creator")
						{
							res.tv_creator[res.tv_creator.length]=
							{
								name:obj.tv_credits.crew[i].name+" ("+new Date(obj.tv_credits.crew[i].first_air_date).getFullYear()+")",
								id:obj.tv_credits.crew[i].id,
								type:"tv",
								poster:obj.tv_credits.crew[i].poster_path
							}
						}
					}
				}
				default:

			}

			return res

		}
	}

	function compare_date(m1, m2)
	{
		if (m1.first_air_date && m2.first_air_date )
			return m1.first_air_date < m2.first_air_date ? 1 : -1
		else if (m1.first_air_date   )
			return -1
		else if (m2.first_air_date )
			return 1
		else if (m1.release_date && m2.release_date)
		{
			return m1.release_date < m2.release_date ? 1 : -1
		}
		else if (m2.release_date )
			return 1
		else if (m1.release_date)
			return -1
		else
			return 0
	}

	function ms_to_minsec(t)
	{
		t=Math.floor(t/1000)
		return Math.floor(t/60)+":"+(t%60)
	}