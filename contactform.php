<?php

if (isset($_POST['submit'])) {
  $name = $_POST['name'];
  $email = $_POST['email'];
  $message = $_POST['message'];
  
  $mailTo = "hello@austinwells.dev";
  $headers = "From: ".$email."\r\nReply-To: ".$email;
  $subject = "New Contact Form Submission";
  $txt = "You have received an email from ".$name.".\n\n".$message;
  
  if (mail($mailTo, $subject, $txt, $headers)) {
    header("Location: contact.html?mailsend=success");
  } else {
    header("Location: contact.html?mailsend=error");
  }
}