#!/usr/bin/env node

`use strict` ;

const colors = require ( `colors` ) ;

const connect_mongo = require ( `connect-mongo` ) ;

const dotenv = require ( `dotenv` ) . config () ;

const express = require ( `express` ) ;

const express_handlebars = require ( `express-handlebars` ) ;

const express_session = require ( `express-session` ) ;

const method_override = require ( `method-override` ) ;

const mongoose = require ( `mongoose` ) ;

const morgan = require ( `morgan` ) ;

const passport = require ( `passport` ) ;

const path = require ( `path` ) ;

const GoogleStrategy = require ( `passport-google-oauth20` ) . Strategy ;

const Users = require ( `./schemas/Users` ) ;

const { formatDate , stripTags , truncate , editIcon , select } = require ( `./helpers/helpers` ) ;

const mongodb_connection = ( async () =>
	{
		try
		{
			const result = await mongoose . connect ( process . env . MONGODB_URI ,
				{
					useNewUrlParser : true ,
					useUnifiedTopology : true ,
					useFindAndModify : false ,
				}
			) ;
			console . log ( `MongoDB listening on host: ` . brightWhite , `${ result . connection . host }` . brightGreen ) ;
			return ;
		}
		catch ( error )
		{
			console . error ( error . message . brightRed ) ;
			return ;
		}
	}
) ;

const passport_connection = ( async ( passport ) =>
	{
		passport . use ( new GoogleStrategy (
			{
				callbackURL : `/auth/google/callback` ,
				clientID : process . env . GOOGLE_CLIENT_ID ,
				clientSecret : process . env . GOOGLE_CLIENT_SECRET ,
			} ,
			async ( accessToken , refreshToken , profile , done ) =>
				{
					const newUser =
					{
						googleId : profile . id ,
						displayName : profile . displayName ,
						firstName : profile . name . givenName ,
						lastName : profile . name . familyName ,
						image : profile . photos [ 0 ] . value ,
					} ;
					try {
						let user = await Users . findOne ( { googleId : profile . id } ) ;
						if ( user )
						{
							done ( null , user ) ;
						}
						else
						{
							user = await Users . create ( newUser ) ;
							done ( null , user ) ;
						}
						return ;
					}
					catch ( error )
					{
						console . error ( error . message . brightRed ) ;
						return ;
					}
				}
			)
		) ;
		passport . serializeUser ( ( user , done ) =>
			{
				done ( null , user . id ) ;
				return ;
			}
		) ;
		passport . deserializeUser ( ( id , done ) =>
			{
				Users . findById ( id , ( err , user ) =>
					{
						done ( err , user ) ;
						return ;
					}
				) ;
				return ;
			}
		) ;
		return ;
	}
) ;

passport_connection ( passport ) ;

mongodb_connection () ;

const app = express () ;

app . use ( express . urlencoded ( { extended : false } ) ) ;

app . use ( express . json () ) ;

app . use ( method_override ( function ( request , response )
	{
		if ( ( request . body ) && ( typeof ( request . body ) === `object` ) && ( `_method` in request . body ) )
		{
			let method = request . body . _method ;
			delete ( request . body . _method ) ;
			return ( method ) ;
		}
	}
) ) ;

if ( process . env . NODE_ENV === `development` )
{
	app . use ( morgan ( `dev` ) ) ;
}

app . engine ( `.hbs` , express_handlebars (
	{
		defaultLayout : `main` ,
		extname : `.hbs` ,
		helpers :
		{
			formatDate ,
			stripTags ,
			truncate ,
			editIcon ,
			select ,
		} ,
	}
) ) ;

app . set ( `view engine` , `.hbs` ) ;

app . use ( express_session (
	{
		secret : `keyboard cat` ,
		resave : false ,
		saveUninitialized : false ,
		store : connect_mongo . create ( { mongoUrl : process . env . MONGODB_URI } ) ,
	}
) ) ;

app . use ( passport . initialize () ) ;

app . use ( passport . session () ) ;

app . use ( function ( request , response , next )
	{
		response . locals . user = request . user || null ;
		next () ;
		return ;
	}
) ;

app . use ( express . static ( path . join ( __dirname , `public` ) ) ) ;

app . use ( `/auth` , require ( `./routes/auth` ) ) ;

app . use ( `/` , require ( `./routes/index` ) ) ;

app . use ( `/stories` , require ( `./routes/stories` ) ) ;

const port = process . env . PORT || 5000 ;

app . listen ( port , () =>
	{
		console . log ( `stories-blogger listening on port: ` . brightWhite , `${ port }` . brightGreen ) ;
		return ;
	}
) ;
