#!/usr/bin/env node

`use strict` ;

const mongoose = require ( `mongoose` ) ;

const UsersSchema = new mongoose . Schema (
	{
		createdAt :
		{
			type : Date ,
			default : Date . now ,
		} ,
		displayName :
		{
			type : String ,
			required : true ,
		} ,
		firstName :
		{
			type : String ,
			required : true ,
		} ,
		googleId :
		{
			type : String ,
			required : true ,
		} ,
		image :
		{
			type : String ,
		} ,
		lastName :
		{
			type : String ,
			required : true ,
		} ,
	}
) ;

module . exports = mongoose . model ( `Users` , UsersSchema ) ;
