#!/usr/bin/env node

`use strict` ;

const mongoose = require ( `mongoose` ) ;

const StoriesSchema = new mongoose . Schema (
	{
		body :
		{
			type : String ,
			required : true ,
		} ,
		createdAt :
		{
			type : Date ,
			default : Date . now ,
		} ,
		status :
		{
			type : String ,
			default : `public` ,
			enum : [ `private` , `public` ] ,
		} ,
		title :
		{
			type : String ,
			required : true ,
			trim : true ,
		} ,
		user :
		{
			type : mongoose . Schema . Types . ObjectId ,
			ref : `User` ,
		} ,
	}
) ;

module . exports = mongoose . model ( `Stories` , StoriesSchema ) ;
