import { useNavigate } from "react-router-dom";
import { handleDelete } from "../../utils/CrudAction";
import API from "../../api/axios";
import { useState, useEffect, useMemo } from "react";
import { FaRegTrashAlt } from "react-icons/fa";
import { CiEdit } from "react-icons/ci";
import AdminLayout from "./AdminLayout";
import DashboardPageHeader from "../../components/ui/DashboardPageHeader";
import EmptyState from "../../components/ui/EmptyState";

const catIdStr = (v) => (typeof v === "object" ? String(v?._id) : String(v));

const buildTree = (items, parentId = null) => {
  return items
    .filter((i) => (parentId ? catIdStr(i.parentId) === catIdStr(parentId) : !i.parentId))
    .sort((a, b) => (a.name || '').localeCompare(b.name || ''))
    .map((i) => ({
      ...i,
      children: buildTree(items, i._id),
    }));
};

function CategoryTreeNode({ node, depth, onEdit, onDelete }) {
  const [open, setOpen] = useState(depth === 0);
  const hasChildren = node.children?.length > 0;
  const label = node.name?.charAt(0).toUpperCase() + node.name.slice(1).toLowerCase();

  return (
    <div className={depth > 0 ? "cw-tree-node" : undefined} style={depth > 0 ? { marginLeft: 24 } : undefined}>
      <div className={`cw-tree-row${depth === 0 ? " cw-tree-row--parent" : ""}`}>
        <button
          type="button"
          className="cw-tree-row__toggle"
          onClick={() => setOpen((v) => !v)}
          disabled={!hasChildren}
          aria-expanded={open}
          aria-label={hasChildren ? (open ? "Collapse" : "Expand") : undefined}
        >
          {hasChildren ? (
            <i className={`fa-solid fa-chevron-right cw-tree-row__chevron${open ? " is-open" : ""}`} aria-hidden="true"></i>
          ) : (
            <i className="fa-solid fa-circle" style={{ fontSize: 6 }} aria-hidden="true"></i>
          )}
        </button>

        {node.image ? (
          <img src={node.image} alt="" aria-hidden="true" className={`cw-tree-row__thumb${depth === 0 ? " cw-tree-row__thumb--parent" : ""}`} />
        ) : (
          <span className={`cw-tree-row__thumb cw-tree-row__thumb--empty${depth === 0 ? " cw-tree-row__thumb--parent" : ""}`}>
            <i className="fa-solid fa-folder" aria-hidden="true"></i>
          </span>
        )}

        <span className={`cw-tree-row__label${depth === 0 ? " cw-tree-row__label--parent" : ""}${open && hasChildren ? " is-open" : ""}`}>{label}</span>

        <span className={`badge rounded-pill cw-badge ${node.status ? "cw-badge--success" : "cw-badge--danger"} ms-2`}>
          {node.status ? "Active" : "Inactive"}
        </span>

        <div className="cw-tree-row__actions">
          <button type="button" className="cw-icon-btn" aria-label={`Edit ${node.name}`} onClick={() => onEdit(node)}>
            <CiEdit />
          </button>
          <button type="button" className="cw-icon-btn cw-icon-btn--danger" aria-label={`Delete ${node.name}`} onClick={() => onDelete(node)}>
            <FaRegTrashAlt />
          </button>
        </div>
      </div>

      {hasChildren && open && (
        <div className="cw-tree-children">
          {node.children.map((child) => (
            <CategoryTreeNode key={child._id} node={child} depth={depth + 1} onEdit={onEdit} onDelete={onDelete} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function CategoriesTree() {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const loadCats = async () => {
    setLoading(true);
    try {
      const res = await API.get("/categories");
      setCategories(res.data.categories || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCats();
  }, []);

  const tree = useMemo(() => buildTree(categories), [categories]);

  const filteredTree = useMemo(() => {
    if (!search.trim()) return tree;
    const q = search.toLowerCase();

    const matches = (node) =>
      node.name?.toLowerCase().includes(q) || node.children.some(matches);

    const filterTree = (nodes) =>
      nodes
        .filter(matches)
        .map((n) => ({ ...n, children: filterTree(n.children) }));

    return filterTree(tree);
  }, [tree, search]);

  const handleEdit = (cat) => navigate(`/admin/categories/edit/${cat._id}`);
  const handleRemove = (cat) =>
    handleDelete({
      id: cat._id,
      route: "categories",
      onSuccess: () => setCategories((prev) => prev.filter((c) => c._id !== cat._id)),
      alertMessage: "Category deleted",
    });

  return (
    <AdminLayout>
      <DashboardPageHeader
        title="Categories Tree"
        action={
          <button type="button" className="nav-btn primary" onClick={() => navigate("/admin/categories/add")}>
            <i className="fa-solid fa-plus" aria-hidden="true"></i>
            Add Category
          </button>
        }
      />
      <p className="text-body-secondary mb-4">Manage all categories easily</p>

      <div className="mb-4 cw-tree-search" style={{ maxWidth: 360 }}>
        <i className="fa-solid fa-magnifying-glass cw-tree-search__icon" aria-hidden="true"></i>
        <input
          type="text"
          className="form-control cw-tree-search__input"
          placeholder="Search category..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="cw-card cw-tree-card">
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary"></div>
          </div>
        ) : filteredTree.length === 0 ? (
          <EmptyState icon="fa-layer-group" title="No categories found" />
        ) : (
          <div>
            {filteredTree.map((node) => (
              <CategoryTreeNode key={node._id} node={node} depth={0} onEdit={handleEdit} onDelete={handleRemove} />
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
