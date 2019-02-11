<html>
  <title>
  </title>
  <body>
    
    <div id='myContainer'></div>
    <style type="text/css">
        body {margin:0; padding:0;} /* remove top and left whitespace */
        canvas {display:block;}    /* remove scrollbars */
        canvas:focus {outline:0;} /* remove blue outline around canvas */
        .fs {position:fixed; bottom:20px; right:20px;}
        #enter {display:block;}
        #exit {display:none;}
    </style>

    <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/0.7.3/p5.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/0.7.3/addons/p5.dom.js"></script>
    
    <h5>Data loaded from canvasID: </h5><h5 id="canvasID">?</h5>
    <h5>Below is the information I tried to put into the db:</h5>
    <h5 id="test">?</h5>
    <script>
      <?php
        $id = 2;
        $conn= mysqli_connect("23.229.228.192","elvin","Luky52133923db","elvinzhu_database");
        $messages = mysqli_query($conn,"SELECT canvas FROM PixelPassCanvas WHERE id=$id");
        $canvas = mysqli_fetch_assoc($messages)["canvas"];
        mysqli_close($conn);
      ?>
      var longText = "<?php echo $canvas ; ?>" ;
      var canvasID = <?php echo $id; ?> ;
      document.getElementById("canvasID").innerHTML = canvasID;
    </script>
    
    <script src = "pixelDraw.php"></script>

  </body>
</html>
