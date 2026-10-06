-- Local-only QA repair. Reserved .invalid addresses are fictional tests.
-- Do not execute this against a production database.
UPDATE registrations SET is_demo=1 WHERE email LIKE '%.invalid';
DELETE FROM rate_limits;
