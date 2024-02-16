# [Football Registration site](https://42football.replit.com)

This website is a registration site for the 42 Football Club. It is built using react and NextJS

## how to run

To run this project, you need to have nodejs installed. You can install it from [here](https://nodejs.org/en/)

A .env file is also requied to run this porject. follow the .env.example file to create your own .env file. You will need to have postgresql database url to run this project.

- You can get the postgresql database url from any postgresql database [provider](neon.com) or you run your own postgresql database server.

There are two tables in the database. One for players and one for Money.

- The players table has the following columns and data types:
	- name: varchar(255)
	- intra: varchar(255)

```
create table players (
	name varchar(255),
	intra varchar(255)
);
```

- The money table has the following columns and data types:
	- date: date
	- name: varchar(255)
	- intra: varchar(255)
	- amount: integer
	- paid: boolean

```
create table money (
	date date,
	name varchar(255),
	intra varchar(255),
	amount INT,
	paid boolean
);
```

```
create table expenses (
	name varchar(255) not null,
	amount integer not null,
	date date not null,
	invoice_id varchar(255) not null,
	primary key (name, date)
);

create table inventory (
	name varchar(255) not null,
	amount integer not null
);
```

After installing nodejs, you can run the following commands in the shell to run the project

```
npm ci
npm run dev
```

The default port is 3000. You can change it by setting port to a different value in the .package.json file

## how to contribute

fork this project and make a pull request. Pull requets will only be merged if the additions are clear, simple and easy to understand. Do not make a multi-purpose pull request. Make a separate pull request for each feature you want to add.

report bugs and request features by creating an issue.

## Under construction

<!-- Welcome to the NextJS base template bootstrapped using the `create-next-app`. This template supports TypeScript, but you can use normal JavaScript as well.

## Getting Started

Hit the run button to start the development server.

You can start editing the page by modifying `pages/index.tsx`. The page auto-updates as you edit the file.

[API routes](https://nextjs.org/docs/api-routes/introduction) can be accessed on `/api/hello`. This endpoint can be edited in `pages/api/hello.ts`.

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/api-routes/introduction) instead of React pages.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

## Productionizing your Next App

To make your next App run smoothly in production make sure to deploy your project with [Repl Deployments](https://docs.replit.com/hosting/deployments/about-deployments)!

You can also produce a production build by running `npm run build` and [changing the run command](https://docs.replit.com/programming-ide/configuring-repl#run) to `npm run start`. -->
