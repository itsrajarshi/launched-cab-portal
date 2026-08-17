-- Seed data for local development and demos.
-- Login credentials:
--   company: company@demo.com / Demo@123
--   vendor:  vendor@demo.com  / Demo@123

insert into users (email, password, role, name) values
  ('company@demo.com', '$2b$10$kMKfn//7UFzFD.bE4kMh5OmFgQLuVwdWFcJzO.uoM0phFZjtDZ3yS', 'company', 'Demo Company'),
  ('vendor@demo.com',  '$2b$10$us.gfWxLgpB1Vf0NUonx6e7WHv7sbjjpOhzzmr3Y3jX63rhUScLIC', 'vendor', 'Demo Vendor')
on conflict (email) do nothing;

insert into drivers (name, contact, license, vehicle_type, vehicle_number, email) values
  ('Arjun Singh', '9876543210', 'DL-042019-12345', 'Sedan', 'KA-01-AB-1234', 'arjun@demo.com'),
  ('Priya Verma', '9876501234', 'MH-122020-67890', 'SUV', 'MH-12-CD-5678', 'priya@demo.com');

insert into vehicles (type, plate, model, availability, condition, insurance) values
  ('Sedan', 'KA-01-AB-1234', 'Toyota Camry', 'Available', 'Good', 'Valid till 2027-01'),
  ('SUV', 'MH-12-CD-5678', 'Ford Endeavour', 'Available', 'Excellent', 'Valid till 2026-12');
