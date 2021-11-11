import { NextApiRequest, NextApiResponse } from "next";

require("dotenv").config();

const base = 'https://eliyah.ny-webb.se/api/';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  let { url } = req.query;
  if (!url) return res.status(400).json({ error: "url is required" });
  if (Array.isArray(url)) {
    url = url.join('/');
  }

  console.log(process.env.AUTH);
  
  const response = await fetch(base + url, {
    method: req.method,
    headers: {
      authorization: process.env.AUTH ?? ''
    }
  });
  const json = await response.json();

  res.status(response.status).json(json);
};