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
if(ctx.update.message.text == "MY ID")  await ctx.reply(ctx.update.message.from.id.toString());
});

bot.start();
//
app.use(express.json())
app.use(express.urlencoded({
  extended: true
}))


const options = {
  key: fs.readFileSync(process.env.KEY_PATH?.toString()),
  cert: fs.readFileSync(process.env.CERT_PATH?.toString)
};

// https.createServer(options, (req:any, res:any) => {
//   res.writeHead(200);
//   res.end(`hello world\n`);
// }).listen(8888);



// app.listen(port, () => {
//   console.log(`Example app listening at http://localhost:${port}`)
// })

const TOKEN = process.env.LINE_ACCESS_TOKEN

//


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



app.post("/webhook", function (req, res) {
  res.send("HTTP POST request sent to the webhook URL!")
  // If the user sends a message to your bot, send a reply message
  if (req.body.events[0].type === "message") {
    var dataString = JSON.stringify({
      replyToken: req.body.events[0].replyToken,
      messages: [
        {
          "type": "text",
          "text": "Hello, user"
        },
        {
          "type": "text",
          "text": "May I help you?"
        }
      ]
    })

    if(req.body.events[0].message.text.toLowerCase() == "ping"){
      dataString = JSON.stringify({
        replyToken: req.body.events[0].replyToken,
        messages: [
          {
            "type": "text",
            "text": "PONG !!!"
          }
        ]
      })
    }else  if(req.body.events[0].message.text.toLowerCase() == "nama"){
      dataString = JSON.stringify({
        replyToken: req.body.events[0].replyToken,
        messages: [
          {
            "type": "text",
            "text": "Boby Kurniawan Nugraha"
          },
          
        ]
      })
    }else{
      dataString = JSON.stringify({
        replyToken: req.body.events[0].replyToken,
        messages: [
          {
            "type": "text",
            "text": "HAHA"
          },
          
        ]
      })
    }

    // Request header
    const headers = {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + TOKEN
    }

 
    // Define request

    axios.post('https://api.line.me/v2/bot/message/reply', dataString, {
      headers:headers
    })
      .then(function (response) {
        console.log("OKE");
      })
      .catch(function (error) {
        console.log("GAS");
      });


  }
})



app.post("/send-message", function (req,res){

  console.log(req.body.messages)

  const dataString = JSON.stringify({
    to: "#target",
    messages: req.body.messages,
  })
  const headers = {
    "Content-Type": "application/json",
    "Authorization": "Bearer " + TOKEN
  }


  // Define request

  axios.post('https://api.line.me/v2/bot/message/push', dataString, {
    headers:headers
  })
    .then(function (response) {
     return  res.send("SUCCESS");
    })
    .catch(function (error) {
      return res.send(error);
    });


})


app.get("/send-message", function (req,res){
  const dataString = JSON.stringify({
    to: "U3b464bf2e33d4d60222c549cf2afe05e",
    messages: [
      {
        "type": "text",
        "text": "Hello, user"
      },
      {
        "type": "text",
        "text": "May I help you?"
      }
    ]
  })
  const headers = {
    "Content-Type": "application/json",
    "Authorization": "Bearer " + TOKEN
  }


  // Define request

  axios.post('https://api.line.me/v2/bot/message/push', dataString, {
    headers:headers
  })
    .then(function (response) {
     return  res.send("SUCCESS");
    })
    .catch(function (error) {
      return res.send(error);
    });


})

const httpServer = http.createServer(app);
const httpsServer = https.createServer(options, app);

httpServer.listen(80, () => {
    console.log('HTTP Server running on port 80');
});

httpsServer.listen(443, () => {
    console.log('HTTPS Server running on port 443');
});

