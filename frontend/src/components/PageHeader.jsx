import { motion } from "framer-motion";

export default function PageHeader({ title, description, action, eyebrow }) {
  return (
    <motion.header
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="page-header"
    >
      <div className="page-header-copy">
        {eyebrow ? <p className="section-kicker">{eyebrow}</p> : null}
        <h1 className="page-title">{title}</h1>
        {description ? <p className="page-description">{description}</p> : null}
      </div>
      {action ? <div>{action}</div> : null}
    </motion.header>
  );
}
