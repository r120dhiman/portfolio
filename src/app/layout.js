"use client"
import localFont from "next/font/local";
import "./globals.css";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});
export default function RootLayout({ children }) {
const [sidebar, setsidebar] = useState(false)
const crosshandle=() => {
  setsidebar(false)
}
const hamburgerhandle=() => {
  setsidebar(true)
}
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <navbar  className="fixed w-full"> 
          <div className={`hamburger z-100 fixed top-5 tab:hidden right-3  w-10 h-10 overflow-hidden transition ease-linear duration-300  `}>
            <Image src="/images/cross.svg" className={`${sidebar?'hidden':'block '}`} onClick={hamburgerhandle} width={40} height={40}/>
            <Image src="/images/hamburger.svg" className={`${sidebar?'block':'hidden'}`} onClick={crosshandle} width={40} height={40}/>
          </div>
          <div className="flex max-w-full z-1000 overflow-hidden flex-row justify-between px-10 py-5 ">
          <div className="rounded-full overflow-hidden">
            <Image className="z-10" src="/images/myphoto.jpg"  width={50}
              height={50}
            ></Image></div>



          <div className={` gap-x-12 z-10 transition-all duration-300 ease-linear flex  tab:flex-row  smallphone:flex-col smallphone:text-sm  ${sidebar?'right-[-300px]  gap-2 rounded-xl font-extrabold':"right-0 "} relative`}>
            <Link href="/" className="bg-none" ><button className="hover:shadow-bluebg px-3 text-2xl bg-none rounded-2xl hover:scale-[1.2] duration-300">Home</button></Link>
            <Link href="/About"><button className="hover:shadow-bluebg px-3 text-2xl rounded-2xl hover:scale-[1.2] duration-300">About</button></Link>
            <Link href="Skills/"><button className="hover:shadow-bluebg px-3 text-2xl rounded-2xl hover:scale-[1.2] duration-300">Skills</button></Link>
            <Link href="/Contact"><button className="hover:shadow-bluebg px-3 text-2xl rounded-2xl hover:scale-[1.2] duration-300">Contact</button></Link>
          </div>
        </div>
        </navbar>
       <div className="relative top-[70px] z-[-10]">
        {children}</div> 
        <footer> <div className="w-full flex justify-center items-center fixed bottom-1 "> <h2> Rohit Dhiman &copy; | All Right Reserved</h2></div></footer>
      </body>
    </html>
  );
}
