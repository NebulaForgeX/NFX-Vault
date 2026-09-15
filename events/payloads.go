package events

type CertEvent struct {
	CertTopic
	Kind string `json:"kind"`
	ID   string `json:"id"`
}

type FileEvent struct {
	FileTopic
	Kind     string `json:"kind"`
	Store    string `json:"store,omitempty"`
	Path     string `json:"path,omitempty"`
	ItemType string `json:"item_type,omitempty"`
	ID       string `json:"id,omitempty"`
}
