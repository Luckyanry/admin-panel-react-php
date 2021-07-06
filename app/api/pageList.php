<?php
$htmlfiles = glob("../../*.html");
$response = [];

foreach($htmlfiles as $file) {
  array_push($response, basename($file));
}
/* 
    Якщо повертаємо просто $htmlfiles - отримаємо стрічку "Array",
    щоб отримати масив використовуємо функцію var_dump($htmlfiles),
    щоб отримати масив у форматі json - json_encode($htmlfiles)
*/
echo json_encode($response);