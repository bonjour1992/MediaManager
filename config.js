module.exports= {
	port :7600,
data	:"/mnt/media",
movie_folder :"/mnt/media/Films",
music_folder :"/mnt/media/music",
	db_user :"root",
	db_password :"1AQWSE4",
	db_base :'media',
	tmdb_key :'63d250a5b71c307f7592228c79b729cf',
	last_fm_key :'1000d1a48bca7bc6d04c955a1ac40bc8',
	append : 
	{
		movie:"images,credits,keywords",
		person:"movie_credits,tv_credits,external_ids,images",
		tv:"images,credits,external_ids"
	},
	video_file : [ ".mp4",".avi",".mkv",".flv"],
	audio_file : [".mp3"]
}	