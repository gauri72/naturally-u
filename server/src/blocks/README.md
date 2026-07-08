# Server-side Block Schemas

Each file here defines the expected `props` shape for one block type
(matching `blockType` in `Page.model.js` and the block registry key on
the frontend). The page controller validates incoming `props` against
these before saving, so a typo from the admin panel can't corrupt a
page document.

Naming convention: `<blockType>.schema.js`, exporting a Joi-style
(or simple manual) validator function `validate(props) -> { error, value }`.

To add a new block type:
1. Add a schema file here.
2. Register it in `index.js`.
3. Add the matching React component + registry entry on the client
   (client/src/blocks/registry).
