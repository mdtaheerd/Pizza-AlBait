-- Seed initial departments
INSERT INTO public.departments (name, description) VALUES
  ('Engineering', 'Software development and technical operations'),
  ('Product', 'Product management and design'),
  ('Marketing', 'Marketing, communications, and brand'),
  ('Sales', 'Sales and business development'),
  ('Human Resources', 'People operations and talent acquisition'),
  ('Finance', 'Finance, accounting, and legal'),
  ('Customer Success', 'Customer support and success')
ON CONFLICT DO NOTHING;
