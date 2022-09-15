#!/usr/bin/env node

`use strict` ;

const colors = require ( `colors` ) ;

const express = require ( `express` ) ;

const router = express . Router () ;

const { ensureAuth , ensureGuest } = require ( `./../middleware/auth` ) ;

const Stories = require ( `./../schemas/Stories` ) ;

router . get ( `/` , ensureGuest , ( request , response ) =>
	{
		response . render ( `login` , { layout : `login` } ) ;
		return ;
	}
) ;

router . get ( `/dashboard` , ensureAuth , async ( request , response ) =>
	{
		try
		{
			const stories = await Stories . find ( { user : request . user . id } ) . lean () ;
			response . render ( `dashboard` , { name : request . user . firstName , stories } ) ;
			return ;
		}
		catch ( error )
		{
			console . error ( error . message . brightRed ) ;
			response . render ( `error/500` ) ;
			return ;
		}
	}
) ;

module . exports = router ;
