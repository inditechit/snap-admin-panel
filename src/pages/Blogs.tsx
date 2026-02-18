import { useState, useEffect } from "react";
import axios from "axios";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { 
  Plus, 
  Edit, 
  Trash2, 
  MoreHorizontal, 
  Image as ImageIcon, 
  Loader2, 
  ArrowRight, 
  ArrowLeft,
  Save
} from "lucide-react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { PageCard } from "@/components/dashboard/PageCard";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner"; // Using sonner based on previous context, or change to useToast if you prefer

const API_URL = "https://api.clickplick.co.uk/api";
const API_URL2 = "https://api.clickplick.co.uk";

const Blogs = () => {
  // Data States
  const [blogs, setBlogs] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal & Step States
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1); // 1 = Details, 2 = Editor
  const [selectedBlog, setSelectedBlog] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form States
  const [formData, setFormData] = useState({
    title: "",
    category_id: "",
    short_content: "",
    content: "",
    tag: "",
    link: "",
    author: "",
    attr: "",
    language: "en"
  });

  useEffect(() => {
    fetchPosts();
    fetchCategories();
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await axios.get(`${API_URL}/posts`);
      setBlogs(res.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching posts:", error);
      toast.error("Failed to load blog posts");
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${API_URL}/posts/categories/all`);
      setCategories(res.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleContentChange = (value: string) => {
    setFormData((prev) => ({ ...prev, content: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (e: any) => {
    const file = e.target.files[0];
    if (!file) return;

    const imageData = new FormData();
    imageData.append("image", file);

    setIsSubmitting(true);
    try {
      const res = await axios.post(`${API_URL}/gallery`, imageData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setFormData((prev) => ({ ...prev, link: res.data.url }));
      toast.success("Image uploaded successfully");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Image upload failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Actions ---

  const handleCreate = async () => {
    setIsSubmitting(true);
    try {
      await axios.post(`${API_URL}/posts`, formData);
      toast.success("Blog post created successfully");
      setAddModalOpen(false);
      resetForm();
      fetchPosts();
    } catch (error) {
      console.error("Create error:", error);
      toast.error("Failed to create post");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async () => {
    if (!selectedBlog) return;
    setIsSubmitting(true);
    try {
      await axios.put(`${API_URL}/posts/${selectedBlog.id}`, formData);
      toast.success("Blog post updated successfully");
      setEditModalOpen(false);
      fetchPosts();
    } catch (error) {
      console.error("Update error:", error);
      toast.error("Failed to update post");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    try {
      await axios.delete(`${API_URL}/posts/${id}`);
      toast.success("Blog post deleted");
      setBlogs(blogs.filter((b) => b.id !== id));
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete post");
    }
  };

  // --- Helper Functions ---

  const resetForm = () => {
    setFormData({
      title: "",
      category_id: "",
      short_content: "",
      content: "",
      tag: "",
      link: "",
      author: "",
      attr: "",
      language: "en"
    });
    setCurrentStep(1); // Reset step
  };

  const openEditModal = (blog: any) => {
    setSelectedBlog(blog);
    setFormData({
      title: blog.title,
      category_id: blog.category_id,
      short_content: blog.short_content,
      content: blog.content,
      tag: blog.tag,
      link: blog.link,
      author: blog.author,
      attr: blog.attr,
      language: blog.language || "en"
    });
    setCurrentStep(1); // Reset step
    setEditModalOpen(true);
  };

  const handleNextStep = () => {
    // Simple validation
    if (!formData.title || !formData.category_id) {
      toast.error("Please fill in Title and Category first");
      return;
    }
    setCurrentStep(2);
  };

  const quillModules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike", "blockquote"],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ color: [] }, { background: [] }],
      ["link", "image", "video"],
      ["clean"],
    ],
  };

  // --- Render Component for Form Steps ---
  // We reuse this logic for both Add and Edit modals
  const renderFormContent = () => (
    <div className="py-4">
      {/* STEP 1: Details */}
      {currentStep === 1 && (
        <div className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-300">
          <div className="space-y-2">
            <Label>Title <span className="text-red-500">*</span></Label>
            <Input name="title" value={formData.title} onChange={handleInputChange} placeholder="Enter blog title" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category <span className="text-red-500">*</span></Label>
              <Select value={formData.category_id?.toString()} onValueChange={(val) => handleSelectChange("category_id", val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Author</Label>
              <Input name="author" value={formData.author} onChange={handleInputChange} placeholder="Author name" />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Featured Image</Label>
            <div className="flex gap-4 items-start border p-3 rounded-md bg-muted/20">
              <div className="flex-1">
                <Input type="file" accept="image/*" onChange={handleImageUpload} className="mb-2"/>
                <p className="text-xs text-muted-foreground">Recommended size: 1200x630px</p>
              </div>
              {formData.link ? (
                <img src={`${API_URL2}${formData.link}`} alt="Preview" className="h-16 w-24 object-cover rounded border bg-white" />
              ) : (
                <div className="h-16 w-24 bg-muted rounded border flex items-center justify-center text-muted-foreground text-xs">
                  No Image
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Short Description (SEO)</Label>
            <Textarea 
              name="short_content" 
              value={formData.short_content} 
              onChange={handleInputChange} 
              placeholder="Brief summary used for previews and SEO..." 
              rows={3} 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tags</Label>
              <Input name="tag" value={formData.tag} onChange={handleInputChange} placeholder="tech, news, update" />
            </div>
            <div className="space-y-2">
              <Label>Attributes</Label>
              <Input name="attr" value={formData.attr} onChange={handleInputChange} placeholder="Optional attributes" />
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: Content Editor */}
      {currentStep === 2 && (
        <div className="space-y-2 animate-in fade-in slide-in-from-right-4 duration-300 h-full flex flex-col">
          <Label className="text-lg font-semibold text-primary">Write your content</Label>
          <div className="flex-1 min-h-[400px]">
            <ReactQuill 
              theme="snow" 
              value={formData.content} 
              onChange={handleContentChange} 
              modules={quillModules}
              className="h-[350px]"
            />
          </div>
        </div>
      )}
    </div>
  );

  return (
    <AdminLayout title="Blogs Management" subtitle="Create and manage blog posts">
      <PageCard
        action={
          <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="mr-2 h-4 w-4" />
                Create Blog
              </Button>
            </DialogTrigger>
            <DialogContent className={currentStep === 2 ? "sm:max-w-4xl" : "sm:max-w-xl"}>
              <DialogHeader>
                <DialogTitle>
                  {currentStep === 1 ? "Step 1: Blog Details" : "Step 2: Write Content"}
                </DialogTitle>
                <DialogDescription>
                  {currentStep === 1 ? "Configure the metadata for your post." : "Use the editor to compose your article."}
                </DialogDescription>
              </DialogHeader>
              
              {renderFormContent()}

              <DialogFooter className="flex justify-between items-center w-full sm:justify-between">
                {currentStep === 1 ? (
                  <>
                    <Button variant="ghost" onClick={() => setAddModalOpen(false)}>Cancel</Button>
                    <Button onClick={handleNextStep}>
                      Next Step <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="outline" onClick={() => setCurrentStep(1)}>
                      <ArrowLeft className="mr-2 h-4 w-4" /> Back to Details
                    </Button>
                    <Button onClick={handleCreate} disabled={isSubmitting}>
                      {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (
                        <>Publish Blog <Save className="ml-2 h-4 w-4" /></>
                      )}
                    </Button>
                  </>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      >
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-20">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <div className="flex justify-center"><Loader2 className="animate-spin" /></div>
                  </TableCell>
                </TableRow>
              ) : blogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No posts found.</TableCell>
                </TableRow>
              ) : (
                blogs.map((blog) => (
                  <TableRow key={blog.id}>
                    <TableCell>
                      {blog.link ? (
                         <img
                           src={`${API_URL2}${blog.link}`}
                           alt={blog.title}
                           className="h-10 w-16 rounded object-cover border"
                           onError={(e: any) => { e.target.src = "https://placehold.co/100?text=No+Img"; }}
                         />
                      ) : (
                        <div className="h-10 w-16 bg-muted rounded flex items-center justify-center">
                          <ImageIcon className="h-4 w-4 text-muted-foreground" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium max-w-[200px] truncate">{blog.title}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-secondary text-secondary-foreground">
                        {blog.category_name || "Uncategorized"}
                      </span>
                    </TableCell>
                    <TableCell>{blog.author}</TableCell>
                    <TableCell>{new Date(blog.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => openEditModal(blog)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDelete(blog.id)} className="text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </PageCard>

      {/* Edit Modal (Reuses logic but separate Dialog for cleanliness) */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className={currentStep === 2 ? "sm:max-w-4xl" : "sm:max-w-xl"}>
          <DialogHeader>
            <DialogTitle>
              {currentStep === 1 ? "Edit: Blog Details" : "Edit: Content"}
            </DialogTitle>
            <DialogDescription>Modify your existing blog post.</DialogDescription>
          </DialogHeader>
          
          {renderFormContent()}

          <DialogFooter className="flex justify-between items-center w-full sm:justify-between">
            {currentStep === 1 ? (
              <>
                <Button variant="ghost" onClick={() => setEditModalOpen(false)}>Cancel</Button>
                <Button onClick={handleNextStep}>
                  Next Step <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={() => setCurrentStep(1)}>
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back to Details
                </Button>
                <Button onClick={handleUpdate} disabled={isSubmitting}>
                   {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (
                    <>Save Changes <Save className="ml-2 h-4 w-4" /></>
                  )}
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default Blogs;