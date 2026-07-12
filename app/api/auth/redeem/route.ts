import { NextResponse } from 'next/server'
import { z } from 'zod'
import { redeemInvite,SESSION_COOKIE } from '@/lib/auth'
export async function POST(request:Request){try{const {token}=z.object({token:z.string().min(20).max(300)}).parse(await request.json());const result=await redeemInvite(token);const response=NextResponse.json({session:result.session});response.cookies.set(SESSION_COOKIE,result.sessionToken,{httpOnly:true,sameSite:'strict',secure:process.env.COOKIE_SECURE!=='false'&&process.env.NODE_ENV==='production',path:'/',maxAge:604800});return response}catch{return NextResponse.json({error:'Invite is invalid or expired'},{status:401})}}
