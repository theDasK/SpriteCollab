<!DOCTYPE html>
<html>
<head>
	<link rel="stylesheet" href="styles.css">
	<title>PMD Portrait Repository</title>
</head>
<body>

<?php

$folders = array();
$jsonstring = file_get_contents("tracker.json");
$json = json_decode($jsonstring,true);

$statusnames = ["Exists","Exists","Fully Fetured"];
?>

	 <div class="topnav">
		<a href="index.php#home">Home</a>
		<a href="list.php">List of Pokemons</a>
		<a href="submit.php">Submit</a>
		<a href="index.php#about">About</a>
	</div>

</body>
</html>