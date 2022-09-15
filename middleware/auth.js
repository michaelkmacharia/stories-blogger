#!/usr/bin/env node

`use strict` ;

module.exports = (
	{
		ensureAuth : function ( request , response , next )
		{
			if ( request . isAuthenticated () )
			{
				return ( next () ) ;
			}
			else
			{
				return ( response . redirect ( `/` ) ) ;
			}
		} ,
		ensureGuest : function ( request , response , next )
		{
			if ( ! request. isAuthenticated () )
			{
				return ( next () ) ;
			}
			else
			{
				return ( response . redirect ( `/dashboard` ) ) ;
			}
		} ,
	}
) ;
