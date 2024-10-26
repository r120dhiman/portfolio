"use client"
import Image from "next/image";
import insta from "/Public/images/insta.svg"
import linkedin from "/Public/images/linkedin.svg"
import mail from "/Public/images/mail.svg"
import github from "/Public/images/github.svg"
import myphoto2 from "/Public/images/my_photo_2.jpeg"


export default function Home() {
  return (<>
  <div className="flex flex-row ">
    <div id="leftpart" className="flex flex-col w-[50vw] h-[90vh] justify-center items-center align-middle">
      <h1 className="text-6xl font-extrabold">Hi, I'm Rohit Kumar</h1>
      <h2 className="text-4xl font-extrabold text-blue-300"> Frontend Developer</h2>
      <p className="text-2xl p-10">Chemical Engineering student at IIT BHU with a passion for frontend development. I thrive on creating visually engaging and user-friendly web applications that enhance the user experience. With a solid foundation in design principles and a keen eye for detail, I love bringing ideas to life through code. Explore my portfolio to see my projects and the technologies I work with!</p>
    </div>
    <div id="rightpart" className="flex flex-col w-[700px] h-[700px]  m-auto justify-center items-center align-middle drop-shadow-custom1 ">
    <div className="w-full h-full">
        <Image src={myphoto2} width={700} height={700} className="rounded-[47%]" />
    </div>
    <div id="media"  className="flex-row flex gap-4">
      <a href="https://instagram.com/rohit.kumar.2005/" target="blank">
      <Image id="insta" src={insta} width={40} height={40}  /></a>
      <a href="https://github.com/r120dhiman/">
      <Image id="github" src={github} width={40} height={40} /></a>
      <a href="https://linkedin.com/in/rohit-kumar2005">
      <Image id="linkedin" src={linkedin} width={40} height={40} /></a>
      <a href="mailto:r120dhiman+website@gmail.com">
      <Image id="mail" src={mail} width={40} height={40} /></a>
    </div>
</div>

  </div>
   
  </>
  );
}
