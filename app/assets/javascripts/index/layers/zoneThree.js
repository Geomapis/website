OSM.initializeMyLayer = function (map) {
	var loadedBounds;
	var zoneThree = map.zoneThree;
  
	zoneThree.setStyle({
	  way: {
		weight: 3,
		color: "#000000",
		opacity: 0.4
	  },
	  area: {
		weight: 3,
		color: "#ff0000"
	  },
	  node: {
		color: "#00ff00"
	  }
	});
  
	zoneThree.isWayArea = function () {
	  return false;
	};
  
	zoneThree.on("click", function (e) {
	  onSelect(e.layer);
	});
  
	map.on("layeradd", function (e) {
	  if (e.layer === zoneThree) {
		map.on("moveend", updateData);
		updateData();
	  }
	});
  
	map.on("layerremove", function (e) {
	  if (e.layer === zoneThree) {
		map.off("moveend", updateData);
		$("#browse_status").empty();
	  }
	});
  
	function updateData() {
	  var bounds = map.getBounds();
	  if (!loadedBounds || !loadedBounds.contains(bounds)) {
		getData();
	  }
	}
  
	function displayFeatureWarning(count, limit, add, cancel) {
	  $("#browse_status").html(
		$("<div class='p-3'>").append(
		  $("<div class='d-flex'>").append(
			$("<h2 class='flex-grow-1 text-break'>")
			  .text(I18n.t("browse.start_rjs.load_data")),
			$("<div>").append(
			  $("<button type='button' class='btn-close'>")
				.attr("aria-label", I18n.t("javascripts.close"))
				.click(cancel))),
		  $("<p class='alert alert-warning'>")
			.text(I18n.t("browse.start_rjs.feature_warning", { num_features: count, max_features: limit })),
		  $("<input type='submit' class='btn btn-primary d-block mx-auto'>")
			.val(I18n.t("browse.start_rjs.load_data"))
			.click(add)));
	}
  
	var dataLoader;
  
	function getData() {
	  var bounds = map.getBounds();
	  var url = "/api/" + OSM.API_VERSION + "/map?bbox=" + bounds.toBBoxString();
  
	  /*
	   * Modern browsers are quite happy showing far more than 100 features in
	   * the data browser, so increase the limit to 2000 by default, but keep
	   * it restricted to 500 for IE8 and 100 for older IEs.
	   */
	  var maxFeatures = 2000;
  
	  /*@cc_on
		if (navigator.appVersion < 8) {
		  maxFeatures = 100;
		} else if (navigator.appVersion < 9) {
		  maxFeatures = 500;
		}
	  @*/
  
	  if (dataLoader) dataLoader.abort();
  
	  dataLoader = $.ajax({
		url: url,
		success: function (xml) {
		  zoneThree.clearLayers();
  
		  var features = zoneThree.buildFeatures(xml);
  
		  features = features.filter(function(feature) {
			return (feature.tags && feature.tags.zone === "3") || feature.tags.name === "Zone 3";
		  });
		  // console.log(typeof(features));
		  // console.log(features);
		  // for (const i of features)
		  //     console.log(i);
  
		  function addFeatures() {
			$("#browse_status").empty();
			zoneThree.addData(features);
			loadedBounds = bounds;
		  }
  
		  function cancelAddFeatures() {
			$("#browse_status").empty();
		  }
  
		  if (features.length < maxFeatures) {
			addFeatures();
		  } else {
			displayFeatureWarning(features.length, maxFeatures, addFeatures, cancelAddFeatures);
		  }
  
		  if (map._objectLayer) {
			map._objectLayer.bringToFront();
		  }
  
		  dataLoader = null;
		}
	  });
	}
  
	function onSelect(layer) {
	  OSM.router.route("/" + layer.feature.type + "/" + layer.feature.id);
	}
  };
  