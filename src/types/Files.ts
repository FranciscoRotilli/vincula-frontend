enum FileOrigin {
  SIMBA,
  SITTEL,
  RIFF,
}

export interface File {
  id: string;
  url: string;
  creation_date: Date;
  case_id: string;
  name: string;
  origin: FileOrigin;
  document_type: string;
  size: string;
}
