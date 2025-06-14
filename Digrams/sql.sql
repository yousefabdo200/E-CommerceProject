create database ECommerce_DB;
use ECommerce_DB;
Create table users(
id int primary key auto_increment,
fname varchar(150) not null,
lname varchar(150) not null,
user_name varchar(150) not null unique,
email varchar(150) not null unique,
password varchar(500) not null,
img varchar(250),
gender ENUM('male', 'female')
);
Create table admins(
id int primary key auto_increment,
fname varchar(150) not null,
lname varchar(150) not null,
email varchar(150) not null unique,
password varchar(500) not null
);
Create table categories
( 
id int primary key auto_increment,
name varchar(150) not null
);
create table products (
id int primary key auto_increment,
name varchar(150) not null,
price float not null,
amount int not null,
img varchar(2500) not null,
description varchar(1500) not null,
admin_id int ,
category_id int,
foreign key(admin_id) references admins(id),
foreign key (category_id) references categories(id)
);

Create table `orders` (
id int primary key auto_increment,
status varchar(10) default "Pending",
created_at timestamp,
updated_at timestamp,
location varchar(250),
admin_id int ,
user_id int,
foreign key(admin_id) references admins(id),
foreign key(user_id) references users(id)
);


 create table product_user
 (
 user_id int,
 product_id int,
 amount int not null,
 primary key(user_id,product_id),
foreign key(product_id) references products(id),
foreign key(user_id) references users(id) 
 );
 
 create table product_order
 (
 order_id int,
 product_id int,
 amount float not null,
 primary key(order_id,product_id),
foreign key(product_id) references products(id),
foreign key(order_id) references `orders`(id) 
 );
 create table discounts
 ( 
amount float not null,
valid_to timestamp,
product_id int primary key,
foreign key(product_id) references products(id)
 
 )
 use ECommerce_DB;
