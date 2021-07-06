<?php
$file = "../../temp-page-dont-change.html"; // захардкодилиб щоб ніхто не змінив копію нашої головної сторінки

if (file_exists($file)) {
  unlink($file); // спеціальна змінна яка в php видаляє вказаний файл
} else {
  header("HTTP/1.0 404 Not Found");
}