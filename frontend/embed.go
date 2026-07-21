package frontend

import "embed"

// Files contains the complete browser application bundled into the Go binary.
//
//go:embed index.html assets
var Files embed.FS
