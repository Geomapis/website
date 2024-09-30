L.OSM.mapdata = function (options) {
	var control = L.control(options);

	control.onAdd = function (map) {
		var $container = $("<div>")
		  .attr("class", "control-map");
	
		var link = $("<a>")
		.attr("href", "#")
		.attr("class", "control-button")
        .attr("data-bs-original-title", I18n.t("javascripts.site.map_data"))
		.html("<span class=\"icon key\"></span>")
		.appendTo($container);

		var input = $("#form-control-id");
		
		  link.on("click", function (e) {
			e.preventDefault();

			var isChecked = input.is(":checked");
			input.prop("checked", !isChecked).change();
			link.toggleClass("active", !isChecked);
		});

		return $container[0];
	  };

	return control;
};
  