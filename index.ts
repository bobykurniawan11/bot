import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import { Bot, Context, session } from "grammy";
import {
  type Conversation,
  type ConversationFlavor,
  conversations,
  createConversation,
} from "@grammyjs/conversations";
import { Menu } from "@grammyjs/menu";
import * as EmailValidator from 'email-validator';

import nodemailer from "nodemailer";
import axios from "axios";
const https = require(`https`);
const fs = require(`fs`);
const http = require('http');

// import transporter from "./email";

type MyContext = Context & ConversationFlavor;
type MyConversation = Conversation<MyContext>;

dotenv.config();

const app: Express = express();
const port = process.env.PORT;




async function greeting(conversation: MyConversation, ctx: MyContext) {
  await ctx.reply(`Halo, Pilih menu dibawah ya (pilih nomor)`);
  await ctx.reply(`1. CV`);
  await ctx.reply(`2. Link Github`);
  await ctx.reply(`3. Instagram`);


  const option: number = await conversation.form.number();

  if (option == 1) {
    await ctx.reply("Masukan email anda, BOT ini akan mengirimkannya secara langsung kepada anda.");
    const email: string = await conversation.form.text();
    const isEmailValid: boolean = EmailValidator.validate(email); // true

    if (isEmailValid) {
      try {
        var mailOptions = {
          from: process.env.EMAIL_USER,
          to: email,
          subject: 'CV - Boby Kurniawan Nugraha',
          text: 'INI CV NYA YA XIXIXI'
        };

        const transporter = nodemailer.createTransport({
          host: 'smtp.gmail.com',
          port: 587,
          secure: false,
          requireTLS: true,
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD,
          },
          logger: true
        });

        await transporter.sendMail(mailOptions);
        await ctx.reply("Email sudah terkirim");
        await ctx.reply("Mulai lagi dari awal dengan mengirim /start");
      } catch (e: any) {
        console.log(e)
        await ctx.reply("Duh ada error nih")
        await ctx.reply(e.toString())

      }
      return;
    } else {
      await ctx.reply(`Email $email tidak valid, yu coba masukan lagi email anda`);
    }


  } else if (option == 2) {
    await ctx.reply(process.env.GITHUB_LINK || "");
    await ctx.reply("Mulai lagi dari awal dengan mengirim /start");
  } else if (option == 3) {
    await ctx.reply("Jangan lupa di follow ya " + process.env.INSTAGRAM_LINK || "");
    await ctx.reply("Mulai lagi dari awal dengan mengirim /start");
    return;

  } else {
    await ctx.reply("Nomor yang anda masukan tidak sesuai");

  }
  return;

}

const bot = new Bot<MyContext>(process.env.BOT_TOKEN || "");

bot.use(session({ initial: () => ({}) }));
bot.use(conversations());
bot.use(createConversation(greeting));


bot.command("start", async (ctx) => {
  await ctx.conversation.enter("greeting");
});

bot.on("message", async (ctx) => {

console.log(ctx.update)


if(ctx.update.message.text == "MY ID")  await ctx.reply(ctx.update.message.from.id.toString());
});

bot.start();
//
app.use(express.json())
app.use(express.urlencoded({
  extended: true
}))


const options = {
  key: fs.readFileSync(process.env.KEY_PATH),
  cert: fs.readFileSync(process.env.CERT_PATH)
};
//
app.post("/send-telegram-photo" , function(req,res) {
  var axios = require('axios');
  var data = JSON.stringify(req.body);
  
  var config = {
    method: 'post',
    url: `https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendPhoto`,
    headers: { 
      'Accept': 'application/json', 
      'Content-Type': 'application/json'
    },
    data : data
  };
  
  axios(config)
  .then(function (response:any) {
   res.send(data)
  })
  .catch(function (error:any) {
    res.send(data)
  });
  
})


app.post("/send-telegram-message" , function(req,res) {
    var axios = require('axios');
    var data = JSON.stringify(req.body);
    
    var config = {
      method: 'post',
      url: `https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`,
      headers: { 
        'Accept': 'application/json', 
        'Content-Type': 'application/json'
      },
      data : data
    };
    
    axios(config)
    .then(function (response:any) {
     res.send(data)
    })
    .catch(function (error:any) {
      res.send(data)
    });
    
})


const httpServer = http.createServer(app);
const httpsServer = https.createServer(options, app);

httpServer.listen(8888, () => {
    console.log('HTTP Server running on port 8888');
});

httpsServer.listen(8889, () => {
    console.log('HTTPS Server running on port 8889');
});

