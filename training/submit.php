<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $fullname = htmlspecialchars($_POST['fullname']);
    $email = htmlspecialchars($_POST['email']);
    $phone = htmlspecialchars($_POST['phone']);
    $course = htmlspecialchars($_POST['course']);
    $message = htmlspecialchars($_POST['message']);

    // Optional: Save data to a file or database
    // Example: append to a text file
    $file = fopen("registrations.txt", "a");
    fwrite($file, "Name: $fullname | Email: $email | Phone: $phone | Course: $course | Message: $message\n");
    fclose($file);
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Registration Successful</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;600&display=swap" rel="stylesheet">
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-100 flex items-center justify-center min-h-screen font-[Outfit]">
  <div class="bg-white shadow-lg rounded-lg p-6 sm:p-8 w-full max-w-md text-center">
    <h2 class="text-2xl font-bold text-green-600 mb-4">Registration Successful!</h2>
    <p class="text-gray-700 mb-4">Thank you, <span class="font-semibold"><?php echo $fullname; ?></span>.</p>
    <p class="text-gray-700 mb-4">You have registered for <span class="font-semibold"><?php echo $course; ?></span>.</p>
    <p class="text-gray-500 text-sm mb-6">A confirmation will be sent to <?php echo $email; ?> soon.</p>

    <a href="index.html"
       class="bg-blue-600 text-white font-bold py-2 px-4 rounded-md hover:bg-blue-700 transition-colors inline-block">
       Register Another Participant
    </a>
  </div>
</body>
</html>
