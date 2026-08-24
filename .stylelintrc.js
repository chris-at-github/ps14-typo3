export default {
	"extends": ["stylelint-config-standard-scss"],
	"plugins": ["stylelint-scss"],
	"rules": {
		"block-no-empty": true,
		"selector-class-pattern": ["^[a-z0-9]+(?:-[a-z0-9]+)*(?:__(?:[a-z0-9]+(?:-[a-z0-9]+)*))?(?:--[a-z0-9]+(?:-[a-z0-9]+)*)?$"],
		"scss/percent-placeholder-pattern": ["^[a-z0-9]+(?:-[a-z0-9]+)*(?:__(?:[a-z0-9]+(?:-[a-z0-9]+)*))?(?:--[a-z0-9]+(?:-[a-z0-9]+)*)?$"]
	}
}
