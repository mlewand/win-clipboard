{
	"targets": [
		{
			"target_name": "addon",
			"sources": [
				"clipboard.cc"
			],
			"defines": [
				"UNICODE"
			],
			"include_dirs" : [
				"<!(node -e \"require('nan')\")"
			]
		}
	]
}