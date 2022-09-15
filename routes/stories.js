#!/usr/bin/env node

`use strict` ;

const colors = require ( `colors` ) ;

const express = require ( `express` ) ;

const router = express . Router () ;

const { ensureAuth } = require ( `./../middleware/auth` ) ;

const Stories = require ( `./../schemas/Stories` ) ;

router . get ( `/add` , ensureAuth , ( request , response ) =>
	{
		response . render ( `stories/add` ) ;
		return ;
	}
) ;

router . post ( `/` , ensureAuth , async ( request , response ) =>
	{
		try
		{
			request . body . user = request . user . id ;
			await Stories . create ( request . body ) ;
			response . redirect ( `/dashboard` ) ;
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

router . get ( `/` , ensureAuth , async ( request , response ) =>
	{
		try
		{
			const stories = await Stories . find ( { status : `public` } ) . populate ( `user` ) . sort ( { createdAt : `desc` } ) . lean () ;
			response . render ( `stories/index` , { stories } ) ;
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

router . get ( `/:id` , ensureAuth , async ( request , response ) =>
	{
		try
		{
			let story = await Stories . findById ( request . params . id ) . populate ( `user` ) . lean () ;
			if ( ! story )
			{
				response . render ( `error/404` ) ;
				return ;
			}
			if ( ( story . user . _id !== request . user . id ) && ( story . status === `private` ) )
			{
				response . render ( `error/404` ) ;
			}
			else
			{
				response . render ( `stories/show` , { story } ) ;
			}
			return ;
		}
		catch ( error )
		{
			console . error ( error . message . brightRed ) ;
			response . render ( `error/404` ) ;
			return ;
		}
	}
) ;

router . get ( `/edit/:id` , ensureAuth , async ( request , response ) =>
	{
		try
		{
			const story = await Stories . findOne ( { _id : request . params . id } ) . lean () ;
			if ( ! story )
			{
				response . render ( `error/404` ) ;
				return ;
			}
			if ( story . user . _id !== request . user . id )
			{
				response . redirect ( `/stories` ) ;
			}
			else
			{
				response . render ( `stories/edit` , { story } ) ;
			}
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

router . put ( `/:id` , ensureAuth , async ( request , response ) =>
	{
		try
		{
			let story = await Stories . findById ( request . params . id ) . lean () ;
			if ( ! story )
			{
				response . render ( `error/404` ) ;
				return ;
			}
			if ( story . user !== request . user . id )
			{
				response . redirect ( `/stories` ) ;
			}
			else
			{
				story = await Stories . findOneAndUpdate ( { _id : request . params . id } , request . body , { new : true , runValidators : true } ) ;
				response . redirect ( `/dashboard` ) ;
			}
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

router . delete ( `/:id` , ensureAuth , async ( request , response ) =>
	{
		try
		{
			let story = await Stories . findById ( request . params . id ) . lean () ;
			if ( ! story )
			{
				response . render ( `error/404` ) ;
				return ;
			}
			if ( story . user !== request . user . id )
			{
				response . redirect ( `/stories` ) ;
			}
			else
			{
				await Stories . remove ( { _id : request . params . id } ) ;
				response . redirect ( `/dashboard` ) ;
			}
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

router . get ( `/user/:userId` , ensureAuth , async ( request , response ) =>
	{
		try
		{
			const stories = await Stories . find ( { user : request . params . userId , status : `public` } ) . populate ( `user` ) . lean () ;
			response . render ( `stories/index` , { stories } ) ;
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
