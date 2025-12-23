export interface IShipmentCompany {
  name: string;
  code: string;
  description?: string;
  contactEmail?: string;
  contactPhone?: string;
  isActive: boolean;
  logo?: string;
  trackingUrl?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IShipmentCompanyCreate {
  name: string;
  code: string;
  description?: string;
  contactEmail?: string;
  contactPhone?: string;
  isActive?: boolean;
  logo?: string;
  trackingUrl?: string;
}

export interface IShipmentCompanyUpdate {
  name?: string;
  code?: string;
  description?: string;
  contactEmail?: string;
  contactPhone?: string;
  isActive?: boolean;
  logo?: string;
  trackingUrl?: string;
}

export interface IShipmentCompanyQuery {
  page?: number;
  limit?: number;
  isActive?: boolean;
  search?: string;
}