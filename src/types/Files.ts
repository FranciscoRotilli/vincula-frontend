enum FileOrigin {
  SIMBA,
  SITTEL,
  RIFF,
}

export interface FileResponse {
  id: string;
  url: string;
  creation_date: Date;
  case_id: string;
  name: string;
  origin: FileOrigin;
  document_type: string;
  size: string;
}

export interface FileRequest {
  origin: string;
  file_type: string;
  file: File;
}

export interface FileFilterParams {
  suspects?: string[];
  names?: string[];
  cpfs_cnpjs?: string[];
  phones?: string[];
}
