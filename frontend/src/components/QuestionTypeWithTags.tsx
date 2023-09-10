import Badge from "./ui-kit/Badge"
import { IconPlus, IconTag, IconX } from "@tabler/icons-react"
import { v4 as uuid } from "uuid"
import Input from "./ui-kit/Input"
import {CommandItem, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandSeparator, Command} from "./ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"
import { Tag } from "lucide-react"
import { useEffect, useState } from "react"

const suggestedTags = [
  {
    label: (<Badge>Background</Badge>),
    tag: "Background"
  },
  {
    label: (<Badge>Technical</Badge>),
    tag: "Technical"
  },
  {
    label: (<Badge>Behavioural</Badge>),
    tag: "Behavioural"
  },
]
interface QuestionTypeWithTagsProps {
  className?: string
  label: string
  tags?: string[]
  deleteQuestion?: () => void
  setTags?: (tags: string[]) => void
}
export default function QuestionTypeWithTags({tags=[], label, deleteQuestion=()=>{}, setTags=()=>{}}: QuestionTypeWithTagsProps) {
  const [tagInput, setTagInput] = useState("")
  const newTag = (newTag: string) => {
    if (tags.find(tag => tag.toLowerCase() == newTag.toLowerCase())) {
      return
    }
    setTags([...tags, newTag]) 
  }
  const deleteTag = (deleteTag: string) => {
    const deleteTagIndex = tags.indexOf(deleteTag)
    if (deleteTagIndex == -1) {
      return
    }   
    setTags(tags.slice(0, deleteTagIndex).concat(tags.slice(deleteTagIndex + 1)))
  }
  return <div className="flex flex-col gap-2 bg-white border rounded-md p-2 w-full text-gray-500">
    <div className="flex justify-between">
      <h5 className="ml-2">
        {label}
      </h5>
      <button onClick={deleteQuestion} type="button" className="text-red-300 hover:bg-red-50 hover:text-red-400">
        <IconX className="w-5 h-5"/>
      </button>
    </div>
    <hr/>
    <Popover>
      <PopoverTrigger className="flex items-center gap-2 100 p-2 rounded-md text-sm hover:bg-gray-100 rounded-md">
        <IconTag className="w-5 h-5"/>
        New Tag
      </PopoverTrigger>
      <PopoverContent className="p-0">
        <Command>
          <CommandInput onSubmit={() => console.log('test')} value={tagInput} onValueChange={search => setTagInput(search.replaceAll(" ", ''))} placeholder="Search or create a tag" />
          <CommandList>
            <CommandEmpty>{`Create new tag: ${tagInput}`}</CommandEmpty>
            <CommandGroup heading="Tag suggestions">
              {suggestedTags.map(st => <CommandItem key={st.tag} 
                onSelect={() => {
                  setTagInput(st.tag)
                  newTag(st.tag)
                }}
              >
                {st.label}
              </CommandItem>)}
            </CommandGroup>
            <CommandSeparator />
            {tagInput.length > 0 && 
              <CommandGroup heading="New tag">
                <CommandItem onSelect={() => {
                  setTagInput(tagInput)
                  newTag(tagInput)
                }}>
                  <Badge>
                    {tagInput}
                  </Badge>
                </CommandItem>
              </CommandGroup>
            }
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
    {tags.length > 0 && 
    <div className="flex gap-2 w-full flex-wrap mb-1">
      {tags.map(tag => <Badge 
        key={uuid()} 
        className="flex items-center justify-between"
        rightIcon={
          <button 
            onClick={() => deleteTag(tag)}
            type="button" className="-m-1.5 p-1.5"
          >
            <IconX className="w-3.5 h-3.5 -mr-1"/>
          </button>
        }
      >
        {tag}
      </Badge>)}
    </div>
    }
  </div> 
}
