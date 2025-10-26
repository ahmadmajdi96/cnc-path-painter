import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, ChevronDown, ChevronRight, Search, Save, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface SubQuestion {
  id: string;
  question: string;
  answer: string;
}

interface Answer {
  id: string;
  text: string;
  subQuestions: SubQuestion[];
  isExpanded: boolean;
}

interface QuestionAnswer {
  id: string;
  question: string;
  answers: Answer[];
  isExpanded: boolean;
}

interface QuestionDataset {
  id: string;
  name: string;
  description: string;
  questionAnswers: QuestionAnswer[];
  createdAt: string;
  status: 'draft' | 'active' | 'archived';
}

const QuestionDatasetPage = () => {
  const { toast } = useToast();
  const [questionDatasets, setQuestionDatasets] = useState<QuestionDataset[]>([]);
  const [selectedDataset, setSelectedDataset] = useState<QuestionDataset | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newDatasetName, setNewDatasetName] = useState('');
  const [newDatasetDescription, setNewDatasetDescription] = useState('');

  const filteredDatasets = useMemo(() => {
    return questionDatasets.filter((dataset) => {
      const matchesSearch = dataset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dataset.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || dataset.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [questionDatasets, searchQuery, statusFilter]);

  const createDataset = () => {
    if (!newDatasetName.trim()) {
      toast({ title: "Name required", variant: "destructive" });
      return;
    }

    const newDataset: QuestionDataset = {
      id: Date.now().toString(),
      name: newDatasetName,
      description: newDatasetDescription,
      questionAnswers: [],
      createdAt: new Date().toISOString(),
      status: 'draft',
    };

    setQuestionDatasets([...questionDatasets, newDataset]);
    setNewDatasetName('');
    setNewDatasetDescription('');
    setCreateDialogOpen(false);
    toast({ title: "Question dataset created successfully" });
  };

  const addQuestionAnswer = () => {
    if (!selectedDataset) return;
    
    const newQA: QuestionAnswer = {
      id: Date.now().toString(),
      question: '',
      answers: [],
      isExpanded: true,
    };

    const updatedDataset = {
      ...selectedDataset,
      questionAnswers: [...selectedDataset.questionAnswers, newQA],
    };

    setSelectedDataset(updatedDataset);
    setQuestionDatasets(questionDatasets.map(d => d.id === selectedDataset.id ? updatedDataset : d));
  };

  const addAnswer = (qaId: string) => {
    if (!selectedDataset) return;

    const updatedQAs = selectedDataset.questionAnswers.map(qa => {
      if (qa.id === qaId) {
        return {
          ...qa,
          answers: [
            ...qa.answers,
            { id: Date.now().toString(), text: '', subQuestions: [], isExpanded: true }
          ]
        };
      }
      return qa;
    });

    const updatedDataset = { ...selectedDataset, questionAnswers: updatedQAs };
    setSelectedDataset(updatedDataset);
    setQuestionDatasets(questionDatasets.map(d => d.id === selectedDataset.id ? updatedDataset : d));
  };

  const addSubQuestion = (qaId: string, answerId: string) => {
    if (!selectedDataset) return;

    const updatedQAs = selectedDataset.questionAnswers.map(qa => {
      if (qa.id === qaId) {
        return {
          ...qa,
          answers: qa.answers.map(answer => {
            if (answer.id === answerId) {
              return {
                ...answer,
                subQuestions: [
                  ...answer.subQuestions,
                  { id: Date.now().toString(), question: '', answer: '' }
                ]
              };
            }
            return answer;
          })
        };
      }
      return qa;
    });

    const updatedDataset = { ...selectedDataset, questionAnswers: updatedQAs };
    setSelectedDataset(updatedDataset);
    setQuestionDatasets(questionDatasets.map(d => d.id === selectedDataset.id ? updatedDataset : d));
  };

  const updateQuestion = (qaId: string, question: string) => {
    if (!selectedDataset) return;

    const updatedQAs = selectedDataset.questionAnswers.map(qa => 
      qa.id === qaId ? { ...qa, question } : qa
    );

    const updatedDataset = { ...selectedDataset, questionAnswers: updatedQAs };
    setSelectedDataset(updatedDataset);
    setQuestionDatasets(questionDatasets.map(d => d.id === selectedDataset.id ? updatedDataset : d));
  };

  const updateAnswer = (qaId: string, answerId: string, text: string) => {
    if (!selectedDataset) return;

    const updatedQAs = selectedDataset.questionAnswers.map(qa => {
      if (qa.id === qaId) {
        return {
          ...qa,
          answers: qa.answers.map(answer =>
            answer.id === answerId ? { ...answer, text } : answer
          )
        };
      }
      return qa;
    });

    const updatedDataset = { ...selectedDataset, questionAnswers: updatedQAs };
    setSelectedDataset(updatedDataset);
    setQuestionDatasets(questionDatasets.map(d => d.id === selectedDataset.id ? updatedDataset : d));
  };

  const updateSubQuestion = (qaId: string, answerId: string, subQId: string, field: 'question' | 'answer', value: string) => {
    if (!selectedDataset) return;

    const updatedQAs = selectedDataset.questionAnswers.map(qa => {
      if (qa.id === qaId) {
        return {
          ...qa,
          answers: qa.answers.map(answer => {
            if (answer.id === answerId) {
              return {
                ...answer,
                subQuestions: answer.subQuestions.map(subQ =>
                  subQ.id === subQId ? { ...subQ, [field]: value } : subQ
                )
              };
            }
            return answer;
          })
        };
      }
      return qa;
    });

    const updatedDataset = { ...selectedDataset, questionAnswers: updatedQAs };
    setSelectedDataset(updatedDataset);
    setQuestionDatasets(questionDatasets.map(d => d.id === selectedDataset.id ? updatedDataset : d));
  };

  const deleteQuestionAnswer = (qaId: string) => {
    if (!selectedDataset) return;

    const updatedQAs = selectedDataset.questionAnswers.filter(qa => qa.id !== qaId);
    const updatedDataset = { ...selectedDataset, questionAnswers: updatedQAs };
    setSelectedDataset(updatedDataset);
    setQuestionDatasets(questionDatasets.map(d => d.id === selectedDataset.id ? updatedDataset : d));
    toast({ title: "Question deleted successfully" });
  };

  const deleteAnswer = (qaId: string, answerId: string) => {
    if (!selectedDataset) return;

    const updatedQAs = selectedDataset.questionAnswers.map(qa => {
      if (qa.id === qaId) {
        return {
          ...qa,
          answers: qa.answers.filter(answer => answer.id !== answerId)
        };
      }
      return qa;
    });

    const updatedDataset = { ...selectedDataset, questionAnswers: updatedQAs };
    setSelectedDataset(updatedDataset);
    setQuestionDatasets(questionDatasets.map(d => d.id === selectedDataset.id ? updatedDataset : d));
    toast({ title: "Answer deleted successfully" });
  };

  const deleteSubQuestion = (qaId: string, answerId: string, subQId: string) => {
    if (!selectedDataset) return;

    const updatedQAs = selectedDataset.questionAnswers.map(qa => {
      if (qa.id === qaId) {
        return {
          ...qa,
          answers: qa.answers.map(answer => {
            if (answer.id === answerId) {
              return {
                ...answer,
                subQuestions: answer.subQuestions.filter(subQ => subQ.id !== subQId)
              };
            }
            return answer;
          })
        };
      }
      return qa;
    });

    const updatedDataset = { ...selectedDataset, questionAnswers: updatedQAs };
    setSelectedDataset(updatedDataset);
    setQuestionDatasets(questionDatasets.map(d => d.id === selectedDataset.id ? updatedDataset : d));
    toast({ title: "Sub-question deleted successfully" });
  };

  const toggleQAExpanded = (qaId: string) => {
    if (!selectedDataset) return;

    const updatedQAs = selectedDataset.questionAnswers.map(qa =>
      qa.id === qaId ? { ...qa, isExpanded: !qa.isExpanded } : qa
    );

    const updatedDataset = { ...selectedDataset, questionAnswers: updatedQAs };
    setSelectedDataset(updatedDataset);
  };

  const toggleAnswerExpanded = (qaId: string, answerId: string) => {
    if (!selectedDataset) return;

    const updatedQAs = selectedDataset.questionAnswers.map(qa => {
      if (qa.id === qaId) {
        return {
          ...qa,
          answers: qa.answers.map(answer =>
            answer.id === answerId ? { ...answer, isExpanded: !answer.isExpanded } : answer
          )
        };
      }
      return qa;
    });

    const updatedDataset = { ...selectedDataset, questionAnswers: updatedQAs };
    setSelectedDataset(updatedDataset);
  };

  const saveDataset = () => {
    if (!selectedDataset) return;
    toast({
      title: "Question dataset saved",
      description: "Your questions and answers have been saved successfully"
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-muted text-muted-foreground';
      case 'active':
        return 'bg-green-500/10 text-green-500';
      case 'archived':
        return 'bg-yellow-500/10 text-yellow-500';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  if (selectedDataset) {
    return (
      <div className="w-full px-6 py-8">
        <div className="mb-8">
          <Button variant="outline" onClick={() => setSelectedDataset(null)} className="mb-4">
            ← Back to Datasets
          </Button>
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold text-foreground">{selectedDataset.name}</h1>
            <div className="flex gap-2">
              <Button onClick={saveDataset}>
                <Save className="w-4 h-4 mr-2" />
                Save Dataset
              </Button>
              <Button onClick={addQuestionAnswer}>
                <Plus className="w-4 h-4 mr-2" />
                Add Question
              </Button>
            </div>
          </div>
          <p className="text-muted-foreground">{selectedDataset.description}</p>
        </div>

        <div className="space-y-4">
          {selectedDataset.questionAnswers.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground mb-4">No questions yet. Start by adding your first question.</p>
                <Button onClick={addQuestionAnswer}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Question
                </Button>
              </CardContent>
            </Card>
          ) : (
            selectedDataset.questionAnswers.map(qa => (
              <Card key={qa.id} className="border-l-4 border-l-primary">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleQAExpanded(qa.id)}
                      >
                        {qa.isExpanded ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </Button>
                      <CardTitle className="text-lg">
                        {qa.question || 'Untitled Question'}
                      </CardTitle>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => addAnswer(qa.id)}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Answer
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteQuestionAnswer(qa.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                {qa.isExpanded && (
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor={`question-${qa.id}`}>Question</Label>
                      <Input
                        id={`question-${qa.id}`}
                        value={qa.question}
                        onChange={(e) => updateQuestion(qa.id, e.target.value)}
                        placeholder="Enter your question"
                      />
                    </div>

                    {qa.answers.length > 0 && (
                      <div className="space-y-3 pl-6 border-l-2 border-muted">
                        <h4 className="font-medium text-sm text-muted-foreground">Answers</h4>
                        {qa.answers.map(answer => (
                          <Card key={answer.id} className="bg-muted/50">
                            <CardContent className="pt-4 space-y-3">
                              <div className="flex justify-between items-start">
                                <div className="flex items-center gap-2 flex-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => toggleAnswerExpanded(qa.id, answer.id)}
                                  >
                                    {answer.isExpanded ? (
                                      <ChevronDown className="w-3 h-3" />
                                    ) : (
                                      <ChevronRight className="w-3 h-3" />
                                    )}
                                  </Button>
                                  <Label className="text-xs">Answer</Label>
                                </div>
                                <div className="flex gap-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => addSubQuestion(qa.id, answer.id)}
                                  >
                                    <Plus className="w-3 h-3 mr-1" />
                                    Sub-Q
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => deleteAnswer(qa.id, answer.id)}
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                              
                              {answer.isExpanded && (
                                <>
                                  <div>
                                    <Textarea
                                      id={`answer-${answer.id}`}
                                      value={answer.text}
                                      onChange={(e) => updateAnswer(qa.id, answer.id, e.target.value)}
                                      placeholder="Enter answer"
                                      rows={2}
                                      className="text-sm"
                                    />
                                  </div>

                                  {answer.subQuestions.length > 0 && (
                                    <div className="space-y-2 pl-4 border-l-2 border-border">
                                      <Label className="text-xs text-muted-foreground">Sub-Questions</Label>
                                      {answer.subQuestions.map(subQ => (
                                        <Card key={subQ.id} className="bg-background">
                                          <CardContent className="pt-3 space-y-2">
                                            <div className="flex justify-between items-start">
                                              <Label className="text-xs">Sub-Question</Label>
                                              <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => deleteSubQuestion(qa.id, answer.id, subQ.id)}
                                              >
                                                <Trash2 className="w-3 h-3" />
                                              </Button>
                                            </div>
                                            <Input
                                              value={subQ.question}
                                              onChange={(e) => updateSubQuestion(qa.id, answer.id, subQ.id, 'question', e.target.value)}
                                              placeholder="Sub-question"
                                              className="text-xs"
                                            />
                                            <Textarea
                                              value={subQ.answer}
                                              onChange={(e) => updateSubQuestion(qa.id, answer.id, subQ.id, 'answer', e.target.value)}
                                              placeholder="Sub-question answer"
                                              rows={2}
                                              className="text-xs"
                                            />
                                          </CardContent>
                                        </Card>
                                      ))}
                                    </div>
                                  )}
                                </>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </CardContent>
                )}
              </Card>
            ))
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-6 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <MessageSquare className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">Question Datasets</h1>
          </div>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Dataset
          </Button>
        </div>
        <p className="text-muted-foreground">
          Create and manage question-answer datasets with dynamic sub-questions
        </p>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search datasets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDatasets.map((dataset) => (
          <Card
            key={dataset.id}
            className="cursor-pointer hover:border-primary transition-colors"
            onClick={() => setSelectedDataset(dataset)}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  <CardTitle className="text-lg">{dataset.name}</CardTitle>
                </div>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {dataset.description}
              </p>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className={`px-2 py-1 rounded text-xs ${getStatusColor(dataset.status)}`}>
                  {dataset.status}
                </div>
                <span className="text-sm text-muted-foreground">
                  {dataset.questionAnswers.length} Q&A
                </span>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredDatasets.length === 0 && questionDatasets.length > 0 && (
          <Card className="col-span-full">
            <CardContent className="py-12 text-center">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No datasets found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search or filters
              </p>
            </CardContent>
          </Card>
        )}

        {questionDatasets.length === 0 && (
          <Card className="col-span-full">
            <CardContent className="py-12 text-center">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No question datasets yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first question dataset to start organizing Q&A pairs
              </p>
              <Button onClick={() => setCreateDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Dataset
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Question Dataset</DialogTitle>
            <DialogDescription>
              Create a new dataset to organize questions with answers and sub-questions
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="dataset-name">Name *</Label>
              <Input
                id="dataset-name"
                placeholder="My Question Dataset"
                value={newDatasetName}
                onChange={(e) => setNewDatasetName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dataset-description">Description</Label>
              <Textarea
                id="dataset-description"
                placeholder="Dataset description..."
                value={newDatasetDescription}
                onChange={(e) => setNewDatasetDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={createDataset}>
              Create Dataset
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default QuestionDatasetPage;
