--Correr en la db:

--Estados de una orden: Pending | Canceled | Delivering | Delivered
SET TIMEZONE='America/Lima';

INSERT INTO public.orderstatuses(
	 "statusCode", description, "dateCreated")
	VALUES ( 'Pending', 'A new order was created.', NOW());

INSERT INTO public.orderstatuses(
	 "statusCode", description, "dateCreated")
	VALUES ( 'Canceled', 'Order was canceled.', NOW());

INSERT INTO public.orderstatuses(
	 "statusCode", description, "dateCreated")
	VALUES ( 'Delivering', 'Order is on the way', NOW());

INSERT INTO public.orderstatuses(
	 "statusCode", description, "dateCreated")
	VALUES ( 'Delivered', 'Order was delivered successfully.', NOW());

--Roles de usuario: Administrador | cocinero | Mesero | Invitado
INSERT INTO public.userrols(name, "dateCreated")
	VALUES ('Administrador', NOW());

INSERT INTO public.userrols(name, "dateCreated")
	VALUES ('Cocinero', NOW());	

INSERT INTO public.userrols(name, "dateCreated")
	VALUES ('Mesero', NOW());	

INSERT INTO public.userrols(name, "dateCreated")
	VALUES ('Invitado', NOW());