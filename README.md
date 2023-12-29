# Next-Prisma-Starter

Next-Prisma-Starter is a boilerplate project designed to help you quickly set up a well-organized development environment for building web applications using Next.js, Prisma, Redux Toolkit, RTK Query, and Tailwind CSS for styling. This starter template provides a solid foundation for your projects, making it easier to get started with popular technologies and best practices.

## Tech Stack

- **Next.js**: A popular React framework for building server-rendered and statically generated applications.
- **Prisma**: A modern database toolkit for Node.js and TypeScript, making database access and management more efficient and developer-friendly.
- **Redux Toolkit**: A library that simplifies state management in React applications, enabling you to write scalable and maintainable code.
- **RTK Query**: A powerful data-fetching library that simplifies fetching, caching, and updating data in your React components.
- **Tailwind CSS**: A utility-first CSS framework for rapidly building custom user interfaces with minimal CSS code.

## Getting Started

To get started with Next-Prisma-Starter, follow these steps:

1. **Add the .env.local fila**:

```sh
DATABASE_URL="postgresql://ofmi:ofmi@localhost:5050/ofmi"
```

2. **Set Up the Database**: Configure your database connection in the `prisma/schema.prisma` file. You can use PostgreSQL, MySQL, SQLite, or another supported database.

3. **Run Migrations**: Apply database migrations to create the database schema.

   ```bash
   npx prisma migrate dev --name your_migration_name
   ```

   For existing schema you can update your schema changes without creating an migration folder with following command:

   ```bash
   npm run push
   ```

4. **Seed Database**: To seed your database with dummy data.

   ```bash
   npm run seed
   ```

   also you can set limit of dummy data you need from the `config` file located at `src/config/default.ts`

5. **Start the Development Server**: Start the Next.js development server.

   ```bash
   npm run dev
   ```

6. **Open Your App**: Your application should now be running at [http://localhost:3000](http://localhost:3000). You can start building your project by modifying the source code located in the `src` directory.

## Folder Structure

Next-Prisma-Starter follows a well-organized folder structure to keep your codebase clean and maintainable. Here's a brief overview:

- `src`: Contains the application's source code, including pages, components, Redux Toolkit setup, and React Query API endpoints.
- `prisma`: Contains Prisma-related files, including the database schema (`schema.prisma`) and migrations.
- `public`: Public assets such as images and fonts can be placed in this directory.
- `styles`: Styling files, including Tailwind CSS configurations and global styles.
- `pages`: Next.js pages for routing and rendering components.
- `api`: Custom API routes for server-side logic.

```bash
next-prisma-starter/
├── prisma/
├── public/
├── src/
│   ├── config/
│   ├── pages/
│   ├── redux/
│   │   ├── api/
│   │   ├── features/
│   ├── styles/
│   ├── types/
│   └── utils/
├── ...
├── package.json
├── tsconfig.json
├── ...

```

## Documentation

For more detailed documentation on how to use Next-Prisma-Starter and its features, refer to the [Wiki](https://github.com/ManishPJha/next-prisma-starter/wiki).

## License

This project is licensed under the MIT License. Feel free to use, modify, and distribute it as needed for your projects. Please refer to the [LICENSE](LICENSE) file for more information.

## Contributions

Contributions are welcome! If you have suggestions, bug reports, or want to contribute to this project, please open an issue or create a pull request.

Happy coding with Next-Prisma-Starter! 🚀

## StandardJS

Install the [StandardJS](https://marketplace.visualstudio.com/items?itemName=standard.vscode-standard) extension.

Activate Auto Fix On Save in the VSCode settings.

## Database

[![](https://mermaid.ink/img/pako:eNqdVm1vmzAQ_ivIn7MqtGkS-LatqjRV06pW-zJFQg5cgjW_sLPZSqr89xnIC8FOSssnuLvHd3783JlXkqoMSEwA7xhdIxULGdjnpwbUwWv7UT_fpAlYFjw-HE3PBplcByAo4451xVCbRFIBjotTx3NHDQRLhiZPMvvqQNbqL6AUIE3CMsdbIKwAETJ_vgKVVKXUjkPnNmOi2QbOuUzFO75TNupt29CEZhmC1raw4H7HznYh25fvbcznNgQGMqoNAhiX6BdjSaA8kaVYAjp-Ji_7N6xI6tP25PNxnlrODFaOXQJb50uFuVKZH-TBeM8lVxJ6hD2ndlk-kKfjqgf8j5Vgb6FrUwUUe9AnxeHjiR8pGpayghqmpLvK6Xdpu6url71d2ep9drSl9e3Dz-6oRts_Ci9WWnSdvlLOBhyyfFVWh7Ysad6X6fFh5GTTjRx8dew8dmJ5BC0go7yXjtO0E_jFgoOM6T8l5WzFwFWyErCmZZHUZ-WV7z6goFr_U5j1BYFqyUE8gS656W6-B7f5qXb0qVOFcGpKD7wmB-6aeegewT3jMEzJKxvp3V3tSErk763hRISH4FSJenj7s5iqcNq4JWcnpXez5-sj7yRq7p3jjbNtp3z3CrQjKjAq2ACqQGHz6Qz1OMip9oAElVVvMHRC21E1KLQdTYNCfT1-CSia-L3-P4bWvhHoIe7cZIgbqVC2v6LPxXUr2V8Una2_AdtX0sCbDrl4GD0JDs_TEnXS_Q2YjIgAtH8Nmf3dahS9ICYHK0cS29eM4u8FWcitjaOlUc-VTEm8olzDiJRFLdLdH9rBanuPxK_khcTXYXR1E41n45somk0m19F0RCoSf5pMrqa38-t5OIui28k0DLcjslHKLhFejW9uo_k4moaz8TychLNmvV-N02AJ2_-YjTC4?type=png)](https://mermaid.live/edit#pako:eNqdVm1vmzAQ_ivIn7MqtGkS-LatqjRV06pW-zJFQg5cgjW_sLPZSqr89xnIC8FOSssnuLvHd3783JlXkqoMSEwA7xhdIxULGdjnpwbUwWv7UT_fpAlYFjw-HE3PBplcByAo4451xVCbRFIBjotTx3NHDQRLhiZPMvvqQNbqL6AUIE3CMsdbIKwAETJ_vgKVVKXUjkPnNmOi2QbOuUzFO75TNupt29CEZhmC1raw4H7HznYh25fvbcznNgQGMqoNAhiX6BdjSaA8kaVYAjp-Ji_7N6xI6tP25PNxnlrODFaOXQJb50uFuVKZH-TBeM8lVxJ6hD2ndlk-kKfjqgf8j5Vgb6FrUwUUe9AnxeHjiR8pGpayghqmpLvK6Xdpu6url71d2ep9drSl9e3Dz-6oRts_Ci9WWnSdvlLOBhyyfFVWh7Ysad6X6fFh5GTTjRx8dew8dmJ5BC0go7yXjtO0E_jFgoOM6T8l5WzFwFWyErCmZZHUZ-WV7z6goFr_U5j1BYFqyUE8gS656W6-B7f5qXb0qVOFcGpKD7wmB-6aeegewT3jMEzJKxvp3V3tSErk763hRISH4FSJenj7s5iqcNq4JWcnpXez5-sj7yRq7p3jjbNtp3z3CrQjKjAq2ACqQGHz6Qz1OMip9oAElVVvMHRC21E1KLQdTYNCfT1-CSia-L3-P4bWvhHoIe7cZIgbqVC2v6LPxXUr2V8Una2_AdtX0sCbDrl4GD0JDs_TEnXS_Q2YjIgAtH8Nmf3dahS9ICYHK0cS29eM4u8FWcitjaOlUc-VTEm8olzDiJRFLdLdH9rBanuPxK_khcTXYXR1E41n45somk0m19F0RCoSf5pMrqa38-t5OIui28k0DLcjslHKLhFejW9uo_k4moaz8TychLNmvV-N02AJ2_-YjTC4)