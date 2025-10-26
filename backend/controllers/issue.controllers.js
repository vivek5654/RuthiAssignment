import Issue from "../models/Issue.js";
import User from "../models/User.js";

export const createIssue = async (req, res) => {
  try {
    const { title, description, priority } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: "Title and description are required" });
    }

    const newIssue = new Issue({
      title,
      description,
      priority: priority || 'Medium',
      reporter: req.user._id
    });

    await newIssue.save();

    res.status(201).json({
      _id: newIssue._id,
      title: newIssue.title,
      description: newIssue.description,
      status: newIssue.status,
      priority: newIssue.priority,
      reporter: req.user._id
    });
  } catch (error) {
    console.log("Error in createIssue controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getIssues = async (req, res) => {
  try {
    let issues = [];

    if (req.user.role === 'Admin' || req.user.role === 'User') {
      // Show all issues for Admin and User roles
      issues = await Issue.find({});
    } else if (req.user.role === 'Developer') {
      // Developer sees assigned and created issues only
      issues = await Issue.find({
        $or: [
          { assignee: req.user._id },
          { reporter: req.user._id }
        ]
      }).populate('reporter', 'name email');
    }

    res.status(200).json(issues);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateIssue = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, title, description, priority } = req.body;

    const issue = await Issue.findById(id);
    
    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    // Only developer and admin can update status
    if (status && req.user.role === 'User') {
      return res.status(403).json({ message: 'Only developers can update status' });
    }

    const updatedIssue = await Issue.findByIdAndUpdate(
      id, 
      { title, description, priority, status }, 
      { new: true }
    );

    res.status(200).json(updatedIssue);
  } catch (error) {
    console.log("Error in updateIssue controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const assignIssue = async (req, res) => {
  try {
    const { id } = req.params;
    const { assigneeId } = req.body;

    // Only admin can assign issues
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Only admin can assign issues' });
    }

    const issue = await Issue.findById(id);
    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    issue.assignee = assigneeId;
    await issue.save();

    res.status(200).json({ message: 'Issue assigned successfully', issue });
  } catch (error) {
    console.log("Error in assignIssue controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const addComment = async (req, res) => {
  try {
    console.log("========== DEBUG addComment ==========");
    console.log("Request URL:", req.originalUrl);
    console.log("Request Method:", req.method);
    console.log("Route param issueId:", req.params.issueId);
    console.log("Body:", req.body);
    console.log("User from auth:", req.user?._id);

    const { issueId } = req.params;
    const { text } = req.body;

    if (!text) {
      console.log("No comment text provided!");
      return res.status(400).json({ message: 'Comment text is required.' });
    }

    const issue = await Issue.findById(issueId);
    console.log("Loaded Issue:", issue ? "Found" : "Not found");

    if (!issue) {
      console.log("Issue not found!");
      return res.status(404).json({ message: 'Issue not found.' });
    }

    issue.comments.push({
      user: req.user._id,
      text,
      createdAt: new Date()
    });

    await issue.save();
    console.log(`Comment added. Total comments now: ${issue.comments.length}`);

    res.status(200).json(issue.comments);
    console.log("========== END DEBUG addComment ==========");
  } catch (error) {
    console.log("Error in addComment:", error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

