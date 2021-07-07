<?php
/* 
    Переміщаємо файл який ми завантажили, передаємо масив даних $_FILES, 
    з якого достаємо ["image"], з яких хочемо дістати назву ["tmp_name"], 
    "../../img.png" - передаємо шляї куди покласти знайдене зображення
*/

if (file_exists($_FILES["image"]["tmp_name"]) && is_uploaded_file($_FILES["image"]["tmp_name"])) {
  // дістаємо тип файла $_FILES["image"]["type"] === "image/jpeg";
  // розбиває стрічку на масив по тому аргументу "/", який ми їй передали і забираємо тільки другу частину [1]
  $fileExt = explode("/", $_FILES["image"]["type"])[1];

  // Створюємо унікальне ім'я файла
  $fileName = uniqid() . "." . $fileExt;

  move_uploaded_file($_FILES["image"]["tmp_name"], "../../img/" . $fileName);

  // повертаємо шлях зображення з сервера на клієнта, "src" повернеться як $fileName
  echo json_encode(array("src" => $fileName));
}
