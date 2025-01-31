'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PencilIcon, Trash2, UserPlus, Search } from 'lucide-react';
import { TeacherDialog } from './components/teacher-dialog';
import { ViewTeacherDialog } from './components/view-teacher-dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { fetchUsers, updateUser } from '@/services/api';

interface Teacher {
  id: number;
  username: string;
  full_name: string | null;
  role: string;
  is_active: boolean;
}

export default function ProfessoresPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<number | null>(null);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadTeachers();
  }, []);

  const loadTeachers = async () => {
    try {
      const response = await fetchUsers();
      setTeachers(response.data.filter((user: Teacher) => user.role === 'teacher'));
    } catch (error) {
      console.error('Error loading teachers:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os professores',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = (id: number) => {
    setSelectedTeacher(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedTeacher) return;

    try {
      await updateUser(selectedTeacher, { is_active: false });
      toast({
        title: 'Sucesso',
        description: 'Professor desativado com sucesso',
      });
      loadTeachers();
    } catch (error) {
      console.error('Error deactivating teacher:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao desativar professor',
        variant: 'destructive',
      });
    }
    setDeleteDialogOpen(false);
    setSelectedTeacher(null);
  };

  const filteredTeachers = teachers.filter(teacher => 
    teacher.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (teacher.full_name && teacher.full_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Professores</h1>
        <TeacherDialog
          mode="create"
          onSuccess={loadTeachers}
          trigger={
            <Button className="bg-pink-600 hover:bg-pink-700">
              <UserPlus className="mr-2 h-4 w-4" />
              Novo Professor
            </Button>
          }
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredTeachers.map((teacher) => (
          <Card key={teacher.id} className="overflow-hidden">
            <CardHeader className="p-4">
              <CardTitle className="text-lg font-semibold">
                {teacher.full_name || teacher.username}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Usuário: {teacher.username}</p>
                <div className="flex gap-2">
                  <Badge variant={teacher.is_active ? 'default' : 'secondary'}>
                    {teacher.is_active ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>
                <div className="flex items-center justify-end gap-2 mt-4">
                  <TeacherDialog
                    mode="edit"
                    teacher={teacher}
                    onSuccess={loadTeachers}
                    trigger={
                      <Button size="icon" variant="outline" className="text-amber-500 hover:text-amber-600">
                        <PencilIcon className="h-4 w-4" />
                      </Button>
                    }
                  />
                  <Button
                    size="icon"
                    variant="outline"
                    className="text-red-500 hover:text-red-600"
                    onClick={() => handleDelete(teacher.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <ViewTeacherDialog teacher={teacher} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar desativação</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja desativar este professor? Esta ação pode ser revertida posteriormente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={confirmDelete}
            >
              Desativar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}