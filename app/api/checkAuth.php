<?php
// Для роботи з сесіями додаємо вбудовану ф-цію
session_start();

if ($_SESSION["auth"] == true) {
  echo json_encode(array("auth" => true));
} else {
  echo json_encode(array("auth" => false));
}
