select name ,nb_seen ,nb_tot,( (nb_seen/nb_tot)/((select count(media ) from rating where user='' and media like 'm%' )/(select count(id) from media where id like 'm%'))) as delta_seen ,rate,(rate-(select avg(rate) from rating where user='1' and media like'm%')) as delta_rate from (select name,count(object) as nb_seen,avg(rate) as rate from link join media on properties=id join rating on media=object where properties like 'k%' group by properties ) as  seen natural join (select name,count(object) as nb_tot from link join media on properties=id  where properties like 'k%' group by properties having count(object)>20  ) as tot  order by nb_seen desc




select * from (select distinct 'song' as type , substring(object,2) as id ,name,artist,album, concat('/data',folder,filename) as filename ,IFNULL(rate,IFNULL(rate_album,IFNULL(rate_artist,'0'))) as rate_song 
	from link 
		join (select * from file  where media like 's%') f on object=f.media 
		join (select * from media  where id like 's%') m on object= id 
		join  (select distinct name as album,object as sa, rate as rate_album  from (select * from media  where id like 'a%') m join ( select * from link where type='album') l on id=properties  left join ( select * from rating where user='1' and media like 'a%') r on media=id ) tab on sa=id  
		join  (select distinct name as artist,object as s, rate as rate_artist  from (select * from media  where id like 'b%') m join ( select * from link where type='artist') l   on id=properties left join ( select * from rating where user='1' and media like 'b%' ) r on media=id ) ta on s=id 
		left join (select * from rating  where media like 's%' and user='1' )  r on id=r.media order by properties,value) t where rate_song>='6'


select * from (select distinct 'song' as type , substring(object,2) as id ,name,artist,album, concat('/data',folder,filename) as filename ,IFNULL(rate,IFNULL(rate_album,IFNULL(rate_artist,'0'))) as rate_song 
	from link 
		join file f on object=f.media 
		join media m on object= id 
		join  (select distinct name as album,object as sa, rate as rate_album  from media join ( select * from link where type='album') l on id=properties  left join ( select * from rating where user='1' ) r on media=id ) tab on sa=id  
		join  (select distinct name as artist,object as s, rate as rate_artist  from media join ( select * from link where type='artist') l   on id=properties left join ( select * from rating where user='1' ) r on media=id ) ta on s=id 
		left join (select * from rating  where  user='1' )  r on id=r.media order by properties,value) t where rate_song>='6'


select id, rate from 

(select media as id  ,rate  from rating where media like 's%' and user ='1' and rate>=6)
union 
(select object as id , rate from rating join link on media =properties where type='album' and user ='1' and rate>=6 and object not in (select media as id  ,rate  from rating where media like 's%' and user ='1' and rate<6)) 
union 
(select object as id , rate from rating join link on media =properties where type='artist' and user ='1' and rate>= 6 and object not in (select media as id  ,rate  from rating where media like 's%' and user ='1' and rate<6) and object not in (select object as id , rate from rating join link on media =properties where type='album' and user ='1' and rate<6))