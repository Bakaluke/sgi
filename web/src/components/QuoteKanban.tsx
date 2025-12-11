import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd';
import { Paper, Title, Text, Group, Badge, Card, ScrollArea, Box, ThemeIcon, Avatar } from '@mantine/core';
import { IconGripVertical } from '@tabler/icons-react';
import type { Quote, SelectOption } from '../types';
import { useNavigate } from 'react-router-dom';

interface QuoteKanbanProps {
    quotes: Quote[];
    statuses: SelectOption[];
    onStatusChange: (quoteId: number, newStatusId: number) => void;
}

const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

export function QuoteKanban({ quotes, statuses, onStatusChange }: QuoteKanbanProps) {
    const navigate = useNavigate();
    const onDragEnd = (result: DropResult) => {
        const { destination, source, draggableId } = result;
        if (!destination) return;
        if (destination.droppableId === source.droppableId && destination.index === source.index) return;
        if (destination.droppableId !== source.droppableId) {
            const quoteId = Number(draggableId);
            const newStatusId = Number(destination.droppableId);
            onStatusChange(quoteId, newStatusId);
        }
    };

    const getQuotesByStatus = (statusId: string) => {
        return quotes.filter(q => String(q.status_id) === statusId);
    };

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <Group align="flex-start" wrap="nowrap" style={{ overflowX: 'auto', paddingBottom: 20 }}>
                {statuses.map((status) => (
                    <Paper key={status.value} withBorder p="sm" radius="md" bg="var(--mantine-color-body)" style={{ minWidth: 300, width: 300, flexShrink: 0 }}>
                        <Group justify="space-between" mb="md">
                            <Title order={5}>{status.label}</Title>
                            <Badge variant="light" color="gray">{getQuotesByStatus(status.value).length}</Badge>
                        </Group>

                        <Droppable droppableId={status.value}>
                            {(provided, snapshot) => (
                                <ScrollArea.Autosize mah="calc(100vh - 250px)" type="auto" {...provided.droppableProps} ref={provided.innerRef} bg={snapshot.isDraggingOver ? 'var(--mantine-color-gray-1)' : 'transparent'} style={{ borderRadius: 8, transition: 'background-color 0.2s' }} >
                                    <Box p={4} style={{ minHeight: 100 }}>
                                        {getQuotesByStatus(status.value).map((quote, index) => (
                                            <Draggable key={quote.id} draggableId={String(quote.id)} index={index}>
                                                {(provided, snapshot) => (
                                                    <Card withBorder shadow={snapshot.isDragging ? 'xl' : 'sm'} mb="sm" radius="md" padding="sm" ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} onClick={() => navigate(`/quotes/${quote.id}`)} style={{ cursor: 'grab', ...provided.draggableProps.style, borderLeft: `4px solid var(--mantine-color-${quote.status?.color || 'blue'}-6)` }} >
                                                        <Group justify="space-between" align="start" mb={4} wrap="nowrap">
                                                            <Text fw={700} size="sm" lineClamp={1}>#{quote.internal_id} - {quote.customer?.name}</Text>
                                                            <ThemeIcon variant="transparent" color="gray" size="xs">
                                                                <IconGripVertical />
                                                            </ThemeIcon>
                                                        </Group>
                                                        
                                                        <Text size="xs" c="dimmed" mb={8}>{new Date(quote.created_at).toLocaleDateString('pt-BR')}</Text>

                                                        <Group justify="space-between" align="center">
                                                            <Text fw={700} size="sm">{formatCurrency(quote.total_amount)}</Text>
                                                            <Avatar size="sm" radius="xl" color="blue">{quote.user?.name?.[0]}</Avatar>
                                                        </Group>
                                                    </Card>
                                                )}
                                            </Draggable>
                                        ))}
                                        {provided.placeholder}
                                    </Box>
                                </ScrollArea.Autosize>
                            )}
                        </Droppable>
                    </Paper>
                ))}
            </Group>
        </DragDropContext>
    );
}