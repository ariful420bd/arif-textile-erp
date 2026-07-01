-- Arif Textile ERP — MySQL Schema
CREATE DATABASE IF NOT EXISTS arif_textile_erp;
USE arif_textile_erp;

CREATE TABLE parties (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  company_name VARCHAR(150),
  phone VARCHAR(30),
  address VARCHAR(255),
  contact_person VARCHAR(100),
  opening_balance DECIMAL(12,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE fabric_types (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE process_types (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE
);

-- Rate Master: flexible, versioned rates. NOT a fixed price.
CREATE TABLE rate_master (
  id INT AUTO_INCREMENT PRIMARY KEY,
  party_id INT NOT NULL,
  fabric_type_id INT NOT NULL,
  process_type_id INT NOT NULL,
  rate_per_pcs DECIMAL(10,2) NOT NULL,
  effective_from DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (party_id) REFERENCES parties(id),
  FOREIGN KEY (fabric_type_id) REFERENCES fabric_types(id),
  FOREIGN KEY (process_type_id) REFERENCES process_types(id)
);

CREATE TABLE receiving_challan (
  id INT AUTO_INCREMENT PRIMARY KEY,
  challan_no VARCHAR(30) UNIQUE NOT NULL,
  party_id INT NOT NULL,
  fabric_type_id INT NOT NULL,
  qty DECIMAL(12,2) NOT NULL,
  unit VARCHAR(20) DEFAULT 'pcs',
  received_date DATE NOT NULL,
  remarks VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (party_id) REFERENCES parties(id),
  FOREIGN KEY (fabric_type_id) REFERENCES fabric_types(id)
);

CREATE TABLE process_jobs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  receiving_id INT NOT NULL,
  process_type_id INT NOT NULL,
  current_stage ENUM('Received','In Process','QC','Ready for Packing','Packed','Delivered') DEFAULT 'Received',
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (receiving_id) REFERENCES receiving_challan(id),
  FOREIGN KEY (process_type_id) REFERENCES process_types(id)
);

CREATE TABLE job_stage_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  job_id INT NOT NULL,
  stage VARCHAR(50) NOT NULL,
  changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  note VARCHAR(255),
  FOREIGN KEY (job_id) REFERENCES process_jobs(id)
);

CREATE TABLE packaging (
  id INT AUTO_INCREMENT PRIMARY KEY,
  job_id INT NOT NULL,
  pcs_count INT NOT NULL,
  bundle_no VARCHAR(50),
  packed_date DATE NOT NULL,
  FOREIGN KEY (job_id) REFERENCES process_jobs(id)
);

CREATE TABLE delivery_challan (
  id INT AUTO_INCREMENT PRIMARY KEY,
  delivery_no VARCHAR(30) UNIQUE NOT NULL,
  job_id INT NOT NULL,
  party_id INT NOT NULL,
  pcs INT NOT NULL,
  delivery_date DATE NOT NULL,
  transport_info VARCHAR(150),
  FOREIGN KEY (job_id) REFERENCES process_jobs(id),
  FOREIGN KEY (party_id) REFERENCES parties(id)
);

CREATE TABLE invoices (
  id INT AUTO_INCREMENT PRIMARY KEY,
  invoice_no VARCHAR(30) UNIQUE NOT NULL,
  party_id INT NOT NULL,
  delivery_id INT NOT NULL,
  pcs INT NOT NULL,
  rate_used DECIMAL(10,2) NOT NULL,
  total_amount DECIMAL(12,2) NOT NULL,
  invoice_date DATE NOT NULL,
  FOREIGN KEY (party_id) REFERENCES parties(id),
  FOREIGN KEY (delivery_id) REFERENCES delivery_challan(id)
);

CREATE TABLE payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  party_id INT NOT NULL,
  invoice_id INT,
  amount DECIMAL(12,2) NOT NULL,
  payment_date DATE NOT NULL,
  method VARCHAR(30) DEFAULT 'Cash',
  FOREIGN KEY (party_id) REFERENCES parties(id),
  FOREIGN KEY (invoice_id) REFERENCES invoices(id)
);

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(30) UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('Admin','Manager','Operator','Accounts') DEFAULT 'Operator',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed some starter data
INSERT INTO fabric_types (name) VALUES ('Cotton'), ('Polyester'), ('Cotton-Blend');
INSERT INTO process_types (name) VALUES ('Dyeing'), ('Printing'), ('Finishing'), ('Dyeing+Finishing');
