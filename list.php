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

foreach (new DirectoryIterator('portrait') as $fileInfo) {
    if($fileInfo->isDot()) continue;
	if($fileInfo->getFilename()=="0000") continue;
    $folders[] = $fileInfo->getFilename();
	
}

$statusnames = ["Exists","Exists","Fully Fetured"];
?>

	 <div class="topnav">
		<a href="index.html#home">Home</a>
		<a class="active" href="list.php#top">List of Pokemons</a>
		<a href="submit.php">Submit</a>
		<a href="index.html#about">About</a>
	</div>
	<div class="gen-separator" id="top">
		<h1>List</h1>
	</div>
	<table class="list-table">
	<?php
		foreach($folders as $entry){
			echo "<tr class=\"entry\">";
			
			echo "<td class=\"pkdex\">Dex Nº #".$entry."</td>";
			echo "<td class=\"portrait\"><img src=\"portrait/".$entry."/Normal.png\"></img></td>";
			echo "<td class=\"name\">".$json[$entry]['name']."</td>";
			
			$status = $json[$entry]['portrait_complete'];
			echo "<td class=\"status-".$status."\">".$statusnames[$status]."</td>";
			
//			if ($status){ status 0 and 1 are the same???
				echo "<td class=\"links\"><a href=\"portrait.php?poke=".$entry."\">Portraits</a></td>";
//			} else {
//				echo "<td class=\"links\"></td>";
//			}
			
			echo "</tr>";
		}
	?>
	
			<td class="id"></td>
			<td class="portrait"></td>
			<td class="name"></td>
			<td class="status"></td>
		</tr>
	</table>
</body>
</html>
